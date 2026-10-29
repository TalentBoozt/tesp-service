"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenantUserManagementRouter = createTenantUserManagementRouter;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const user_schema_1 = require("../../../auth/infrastructure/persistence/user.schema");
const user_entity_1 = require("../../../auth/domain/entities/user.entity");
const bcrypt_hasher_service_1 = require("../../../auth/infrastructure/services/bcrypt-hasher.service");
const change_password_use_case_1 = require("../../../auth/application/use-cases/change-password.use-case");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const system_email_service_1 = require("../../../../shared/infrastructure/email/system-email.service");
function createTenantUserManagementRouter() {
    const router = (0, express_1.Router)();
    const isCallerAuthorizedForProject = async (caller, targetProjectId, requireConsultantOrSuperAdmin = false) => {
        if (caller.role === auth_middleware_1.UserRole.SUPER_ADMIN)
            return true;
        if (requireConsultantOrSuperAdmin && caller.role !== auth_middleware_1.UserRole.CONSULTANT_DAASH) {
            return false;
        }
        if (caller.projectId === targetProjectId)
            return true;
        try {
            const callerDoc = await user_schema_1.UserModel.findOne({ userId: caller.userId }).exec();
            if (callerDoc) {
                if (callerDoc.authorizedProjectIds?.includes('*') || callerDoc.authorizedProjectIds?.includes(targetProjectId)) {
                    return true;
                }
                if (callerDoc.primaryProjectId === targetProjectId) {
                    return true;
                }
            }
        }
        catch {
            // Fallback when disconnected or unmocked
        }
        return false;
    };
    /**
     * GET /api/v1/projects/:projectId/users
     * Lists all users assigned to a specific client enterprise project workspace
     */
    router.get('/projects/:projectId/users', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const { projectId } = req.params;
            const caller = req.user;
            const authorized = await isCallerAuthorizedForProject(caller, projectId, false);
            if (!authorized) {
                return res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/tenant-access-denied',
                    title: 'Forbidden',
                    status: 403,
                    detail: `You are not authorized to view users for project '${projectId}'.`,
                });
            }
            let users = [];
            try {
                users = await user_schema_1.UserModel.find({
                    $or: [
                        { primaryProjectId: projectId },
                        { authorizedProjectIds: projectId },
                    ],
                })
                    .select('-passwordHash')
                    .sort({ createdAt: -1 })
                    .lean();
            }
            catch {
                users = [];
            }
            return res.status(200).json({
                success: true,
                count: users.length,
                users,
            });
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * POST /api/v1/projects/:projectId/users
     * Super Admins and Consultants provision new client enterprise users and roles for a project
     */
    router.post('/projects/:projectId/users', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const { projectId } = req.params;
            const caller = req.user;
            const authorized = await isCallerAuthorizedForProject(caller, projectId, true);
            if (!authorized) {
                return res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/forbidden',
                    title: 'Forbidden',
                    status: 403,
                    detail: `Only Super Admins or authorized Consultants can provision users for project '${projectId}'.`,
                });
            }
            const { email, firstName, lastName, role, temporaryPassword } = req.body || {};
            if (!email || !firstName || !role || !temporaryPassword) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'Email, firstName, role, and temporaryPassword are required.',
                });
            }
            const normalizedEmail = (email || '').trim().toLowerCase();
            if (!user_entity_1.UserEntity.EMAIL_REGEX.test(normalizedEmail)) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Invalid Email',
                    status: 400,
                    detail: `Invalid email address format: '${email}'.`,
                });
            }
            // Privilege Escalation Guard
            const restrictedRoles = [auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH];
            if (caller.role !== auth_middleware_1.UserRole.SUPER_ADMIN && restrictedRoles.includes(role)) {
                return res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/forbidden',
                    title: 'Privilege Escalation Prohibited',
                    status: 403,
                    detail: 'Consultants cannot provision Super Admin or Consultant accounts.',
                });
            }
            if (!change_password_use_case_1.ChangePasswordUseCase.PASSWORD_COMPLEXITY_REGEX.test(temporaryPassword)) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/weak-password',
                    title: 'Weak Password',
                    status: 400,
                    detail: 'Temporary password must be 8-128 characters long and contain uppercase, lowercase, numbers, and special characters.',
                });
            }
            const hasher = new bcrypt_hasher_service_1.BcryptHasherService(12);
            const passwordHash = await hasher.hashPassword(temporaryPassword);
            let userDoc = null;
            try {
                userDoc = await user_schema_1.UserModel.findOne({ email: normalizedEmail }).exec();
            }
            catch {
                userDoc = null;
            }
            if (userDoc) {
                if (!userDoc.authorizedProjectIds.includes(projectId)) {
                    userDoc.authorizedProjectIds.push(projectId);
                }
                userDoc.role = role;
                userDoc.passwordHash = passwordHash;
                userDoc.mustChangePassword = true;
                await userDoc.save();
            }
            else {
                const userId = `USR-ORG-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
                userDoc = await user_schema_1.UserModel.create({
                    userId,
                    email: normalizedEmail,
                    firstName: firstName.trim(),
                    lastName: (lastName || '').trim(),
                    role,
                    passwordHash,
                    primaryProjectId: projectId,
                    authorizedProjectIds: [projectId],
                    mustChangePassword: true,
                    failedLoginAttempts: 0,
                    isActive: true,
                    isEmailVerified: true,
                });
            }
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'PROJECT_USER_PROVISIONED',
                actorId: caller.userId,
                actorRole: caller.role,
                resource: `USER:${userDoc.userId}`,
                details: {
                    userId: userDoc.userId,
                    email: userDoc.email,
                    role: userDoc.role,
                    projectId,
                },
            });
            // Dispatch user onboarding/provisioning email via system Zoho SMTP
            await system_email_service_1.systemEmailService.sendUserInvitationEmail({
                to: normalizedEmail,
                firstName: firstName.trim(),
                role,
                projectName: projectId,
                temporaryPassword,
                loginUrl: `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/login`,
            }).catch((err) => console.error('[TenantUserManagement] Failed to send user provisioning email:', err));
            return res.status(201).json({
                success: true,
                message: 'User provisioned for project.',
                user: {
                    userId: userDoc.userId,
                    email: userDoc.email,
                    firstName: userDoc.firstName,
                    lastName: userDoc.lastName,
                    role: userDoc.role,
                    primaryProjectId: userDoc.primaryProjectId,
                    authorizedProjectIds: userDoc.authorizedProjectIds,
                    mustChangePassword: userDoc.mustChangePassword,
                    isActive: userDoc.isActive,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * PATCH /api/v1/projects/:projectId/users/:userId/role
     * Super Admins and Consultants modify a user's role in a project
     */
    router.patch('/projects/:projectId/users/:userId/role', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            if (mongoose_1.default.connection?.readyState !== 1) {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Database connection is unavailable. Please retry shortly.',
                });
            }
            const { projectId, userId } = req.params;
            const { role } = req.body || {};
            const caller = req.user;
            const authorized = await isCallerAuthorizedForProject(caller, projectId, true);
            if (!authorized) {
                return res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/forbidden',
                    title: 'Forbidden',
                    status: 403,
                    detail: `Only Super Admins or authorized Consultants can modify user roles for project '${projectId}'.`,
                });
            }
            if (!role) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'Role is required.',
                });
            }
            // Privilege Escalation Guard
            const restrictedRoles = [auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH];
            if (caller.role !== auth_middleware_1.UserRole.SUPER_ADMIN && restrictedRoles.includes(role)) {
                return res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/forbidden',
                    title: 'Privilege Escalation Prohibited',
                    status: 403,
                    detail: 'Consultants cannot grant Super Admin or Consultant privileges.',
                });
            }
            let target = null;
            try {
                target = await user_schema_1.UserModel.findOne({ userId }).exec();
            }
            catch {
                target = null;
            }
            if (!target) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/user-not-found',
                    title: 'User Not Found',
                    status: 404,
                    detail: `User '${userId}' was not found.`,
                });
            }
            target.role = role;
            await target.save();
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'USER_ROLE_UPDATED',
                actorId: caller.userId,
                actorRole: caller.role,
                resource: `USER:${target.userId}`,
                details: {
                    userId: target.userId,
                    newRole: role,
                    projectId,
                },
            });
            return res.status(200).json({
                success: true,
                message: 'User role updated successfully.',
                user: {
                    userId: target.userId,
                    email: target.email,
                    role: target.role,
                    primaryProjectId: target.primaryProjectId,
                    authorizedProjectIds: target.authorizedProjectIds,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=tenant-user-management.routes.js.map