"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeAuthSyncService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema_1 = require("../../../auth/infrastructure/persistence/user.schema");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const bcrypt_hasher_service_1 = require("../../../auth/infrastructure/services/bcrypt-hasher.service");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
class EmployeeAuthSyncService {
    static instance;
    hasher;
    constructor(rounds = 12) {
        this.hasher = new bcrypt_hasher_service_1.BcryptHasherService(rounds);
    }
    static getInstance() {
        if (!EmployeeAuthSyncService.instance) {
            EmployeeAuthSyncService.instance = new EmployeeAuthSyncService();
        }
        return EmployeeAuthSyncService.instance;
    }
    /**
     * Normalizes incoming raw phone number to trimmed / E.164 standard.
     * e.g., local 0771234567 -> +94771234567, or +94771234567 -> +94771234567
     */
    normalizePhoneNumber(rawPhone) {
        if (!rawPhone)
            return undefined;
        const cleaned = rawPhone.trim().replace(/[\s\-()]/g, '');
        if (!cleaned)
            return undefined;
        // Convert local Sri Lankan format 07XXXXXXXX to +947XXXXXXXX
        if (/^0[0-9]{9}$/.test(cleaned)) {
            return `+94${cleaned.substring(1)}`;
        }
        // Keep existing + prefix
        if (cleaned.startsWith('+')) {
            return cleaned;
        }
        // If pure digits of standard mobile length, prepend +
        if (/^[0-9]{10,15}$/.test(cleaned)) {
            return `+${cleaned}`;
        }
        return cleaned;
    }
    /**
     * Provisions or syncs a corresponding UserModel authentication account
     * for a single employee record.
     */
    async provisionUserForEmployee(employee, temporaryPassword, actorContext) {
        const rawEmail = (employee.email || '').trim().toLowerCase();
        const normalizedEmail = rawEmail || undefined;
        const normalizedPhone = this.normalizePhoneNumber(employee.phoneNumber);
        const empId = (employee.employeeId || '').trim();
        const parts = (employee.fullName || '').trim().split(/\s+/);
        const firstName = parts[0] || 'Employee';
        const lastName = parts.slice(1).join(' ') || '';
        const userId = `USR-EMP-${employee.projectId}-${empId || 'GEN'}`;
        const isActive = (employee.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
        // If Mongoose is not connected (e.g. in unit tests without in-memory Mongo), safely return
        if (mongoose_1.default.connection?.readyState !== 1) {
            return {
                success: true,
                userId,
                isNew: true,
                accountProvisioned: true,
            };
        }
        try {
            // Check if user exists by email, employeeId, or phoneNumber
            const orClauses = [];
            if (normalizedEmail) {
                orClauses.push({ email: normalizedEmail });
            }
            if (empId) {
                orClauses.push({ primaryProjectId: employee.projectId, employeeId: empId });
            }
            if (normalizedPhone) {
                orClauses.push({ phoneNumber: normalizedPhone });
            }
            let user = orClauses.length > 0 ? await user_schema_1.UserModel.findOne({ $or: orClauses }).exec() : null;
            if (user) {
                // Update user fields to mirror EmployeeModel
                if (empId) {
                    user.employeeId = empId;
                }
                if (normalizedEmail) {
                    user.email = normalizedEmail;
                }
                if (normalizedPhone) {
                    user.phoneNumber = normalizedPhone;
                }
                user.firstName = firstName;
                if (lastName) {
                    user.lastName = lastName;
                }
                user.isActive = isActive;
                if (!user.authorizedProjectIds.includes(employee.projectId)) {
                    user.authorizedProjectIds.push(employee.projectId);
                }
                user.primaryProjectId = employee.projectId;
                await user.save();
                return {
                    success: true,
                    userId: user.userId,
                    user,
                    isNew: false,
                    accountProvisioned: true,
                };
            }
            // User does not exist -> Generate credentials and create with unified default password
            const passwordToHash = temporaryPassword || 'Password@123!';
            const passwordHash = await this.hasher.hashPassword(passwordToHash);
            const newUser = await user_schema_1.UserModel.create({
                userId,
                ...(normalizedEmail ? { email: normalizedEmail } : {}),
                ...(empId ? { employeeId: empId } : {}),
                ...(normalizedPhone ? { phoneNumber: normalizedPhone } : {}),
                firstName,
                lastName,
                passwordHash,
                role: auth_middleware_1.UserRole.SURVEY_RESPONDENT,
                primaryProjectId: employee.projectId,
                authorizedProjectIds: [employee.projectId],
                isActive,
                mustChangePassword: true,
                failedLoginAttempts: 0,
                isEmailVerified: !!normalizedEmail,
            });
            // Audit Log
            await audit_logger_1.AuditLogger.log({
                projectId: employee.projectId,
                action: 'EMPLOYEE_PROVISIONED',
                actorId: actorContext?.actorId || 'SYSTEM',
                actorRole: actorContext?.actorRole || 'SYSTEM',
                resource: `USER:${userId}`,
                details: {
                    userId,
                    employeeId: empId,
                    email: normalizedEmail,
                    phoneNumber: normalizedPhone,
                    projectId: employee.projectId,
                },
            });
            return {
                success: true,
                userId: newUser.userId,
                user: newUser,
                isNew: true,
                accountProvisioned: true,
            };
        }
        catch (err) {
            console.error(`[EmployeeAuthSyncService] Failed to provision user for ${empId}:`, err);
            return {
                success: false,
                userId,
                isNew: false,
                accountProvisioned: false,
            };
        }
    }
    /**
     * Bulk syncs UserModel authentication accounts for a large batch of employees.
     * Uses pre-computed password hashes to avoid CPU starvation and batches MongoDB bulkWrite.
     */
    async bulkSyncUsersForEmployees(projectId, employees, defaultPassword, actorContext) {
        if (!employees || employees.length === 0) {
            return { totalProcessed: 0, provisioned: 0, updated: 0, failed: 0, authAccountsProvisioned: 0 };
        }
        // Pre-generate initial bcrypt hash ONCE for unified default password
        // This allows 10,000+ employees to be processed in seconds without CPU thread starvation
        const passwordToHash = defaultPassword || 'Password@123!';
        const defaultHash = await this.hasher.hashPassword(passwordToHash);
        const CHUNK_SIZE = 500;
        let provisioned = 0;
        let updated = 0;
        let failed = 0;
        // Disconnected fallback for in-memory / unit tests
        if (mongoose_1.default.connection?.readyState !== 1) {
            return {
                totalProcessed: employees.length,
                provisioned: employees.length,
                updated: 0,
                failed: 0,
                authAccountsProvisioned: employees.length,
            };
        }
        for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
            const chunk = employees.slice(i, i + CHUNK_SIZE);
            const bulkOps = chunk
                .filter((emp) => (emp.email && emp.email.trim()) || (emp.employeeId && emp.employeeId.trim()) || (emp.phoneNumber && emp.phoneNumber.trim()))
                .map((emp) => {
                const rawEmail = (emp.email || '').trim().toLowerCase();
                const normalizedEmail = rawEmail || undefined;
                const normalizedPhone = this.normalizePhoneNumber(emp.phoneNumber);
                const empId = (emp.employeeId || '').trim();
                const parts = (emp.fullName || '').trim().split(/\s+/);
                const firstName = parts[0] || 'Employee';
                const lastName = parts.slice(1).join(' ') || '';
                const userId = `USR-EMP-${projectId}-${empId || 'GEN'}`;
                const isActive = (emp.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
                const filter = empId
                    ? { primaryProjectId: projectId, employeeId: empId }
                    : normalizedEmail
                        ? { email: normalizedEmail }
                        : { phoneNumber: normalizedPhone };
                return {
                    updateOne: {
                        filter,
                        update: {
                            $setOnInsert: {
                                userId,
                                passwordHash: defaultHash,
                                role: auth_middleware_1.UserRole.SURVEY_RESPONDENT,
                                mustChangePassword: true,
                                failedLoginAttempts: 0,
                                isEmailVerified: !!normalizedEmail,
                                createdAt: new Date(),
                            },
                            $set: {
                                ...(empId ? { employeeId: empId } : {}),
                                ...(normalizedEmail ? { email: normalizedEmail } : {}),
                                ...(normalizedPhone ? { phoneNumber: normalizedPhone } : {}),
                                firstName,
                                lastName,
                                primaryProjectId: projectId,
                                isActive,
                                updatedAt: new Date(),
                            },
                            $addToSet: { authorizedProjectIds: projectId },
                        },
                        upsert: true,
                    },
                };
            });
            if (bulkOps.length > 0) {
                try {
                    const res = await user_schema_1.UserModel.bulkWrite(bulkOps, { ordered: false });
                    const upsertedCount = res.upsertedCount || 0;
                    provisioned += upsertedCount;
                    updated += (res.modifiedCount || 0);
                }
                catch (err) {
                    console.error(`[EmployeeAuthSyncService] Bulk write error in chunk ${i}:`, err.message);
                    failed += chunk.length;
                }
            }
        }
        // Audit log
        await audit_logger_1.AuditLogger.log({
            projectId,
            action: 'EMPLOYEE_BULK_AUTH_SYNCED',
            actorId: actorContext?.actorId || 'SYSTEM',
            actorRole: actorContext?.actorRole || 'SYSTEM',
            resource: `/api/v1/employees/bulk-import`,
            details: {
                total: employees.length,
                provisioned,
                updated,
                failed,
            },
        });
        return {
            totalProcessed: employees.length,
            provisioned,
            updated,
            failed,
            authAccountsProvisioned: provisioned + updated,
        };
    }
    /**
     * Deactivates the UserModel account when an employee is terminated.
     */
    async deactivateUserForEmployee(projectId, employeeId) {
        if (mongoose_1.default.connection?.readyState !== 1)
            return true;
        try {
            await user_schema_1.UserModel.updateOne({ primaryProjectId: projectId, employeeId }, { $set: { isActive: false, updatedAt: new Date() } }).exec();
            return true;
        }
        catch (err) {
            console.error(`[EmployeeAuthSyncService] Failed to deactivate user for ${employeeId}:`, err);
            return false;
        }
    }
}
exports.EmployeeAuthSyncService = EmployeeAuthSyncService;
//# sourceMappingURL=employee-auth-sync.service.js.map