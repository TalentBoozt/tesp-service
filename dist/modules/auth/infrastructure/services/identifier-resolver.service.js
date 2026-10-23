"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierResolverService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongo_user_repository_1 = require("../persistence/mongo-user.repository");
const employee_schema_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.schema");
class IdentifierResolverService {
    userRepository;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository()) {
        this.userRepository = userRepository;
    }
    /**
     * Normalizes and classifies an incoming raw identifier:
     * - Contains '@' -> EMAIL
     * - Phone format (starts with '+' or 9-15 numeric digits) -> PHONE
     * - Otherwise -> EMPLOYEE_ID
     */
    normalizeIdentifier(raw) {
        const trimmed = (raw || '').trim();
        if (!trimmed) {
            return { type: 'EMPLOYEE_ID', value: '' };
        }
        if (trimmed.includes('@')) {
            return {
                type: 'EMAIL',
                value: trimmed.toLowerCase(),
            };
        }
        // Strip common formatting characters like spaces, dashes, parentheses
        const cleanedPhone = trimmed.replace(/[\s\-()]/g, '');
        if (/^\+?[0-9]{9,15}$/.test(cleanedPhone)) {
            return {
                type: 'PHONE',
                value: cleanedPhone,
            };
        }
        return {
            type: 'EMPLOYEE_ID',
            value: trimmed,
        };
    }
    /**
     * Resolves a UserEntity from an identifier (email, phone, employeeId)
     * with optional tenant project scope and employee fallback lookup.
     */
    async findUserByIdentifier(identifier, projectId) {
        const normalized = this.normalizeIdentifier(identifier);
        if (!normalized.value)
            return null;
        let user = null;
        if (normalized.type === 'EMAIL') {
            user = await this.userRepository.findByEmail(normalized.value);
            if (user)
                return user;
        }
        else if (normalized.type === 'PHONE') {
            user = await this.userRepository.findByPhoneNumber(normalized.value);
            // Fallback cross-check for local (077...) vs international (+9477...) format
            if (!user && normalized.value.startsWith('+94')) {
                const local = '0' + normalized.value.substring(3);
                user = await this.userRepository.findByPhoneNumber(local);
            }
            else if (!user && normalized.value.startsWith('0')) {
                const intl = '+94' + normalized.value.substring(1);
                user = await this.userRepository.findByPhoneNumber(intl);
            }
            if (user)
                return user;
        }
        else {
            // EMPLOYEE_ID lookup
            user = await this.userRepository.findByEmployeeId(normalized.value, projectId);
            if (user)
                return user;
        }
        // Fallback: Query Employee directory if not directly found in UserModel (only if connected)
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const employeeFilter = { isDeleted: { $ne: true } };
                if (projectId) {
                    employeeFilter.projectId = projectId;
                }
                if (normalized.type === 'EMAIL') {
                    employeeFilter.email = normalized.value;
                }
                else if (normalized.type === 'PHONE') {
                    const phoneVariants = [normalized.value];
                    if (normalized.value.startsWith('+94')) {
                        phoneVariants.push('0' + normalized.value.substring(3));
                    }
                    else if (normalized.value.startsWith('0')) {
                        phoneVariants.push('+94' + normalized.value.substring(1));
                    }
                    employeeFilter.phoneNumber = { $in: phoneVariants };
                }
                else {
                    employeeFilter.employeeId = normalized.value;
                }
                const employee = await employee_schema_1.EmployeeModel.findOne(employeeFilter).exec();
                if (employee) {
                    if (employee.email) {
                        const matchedUser = await this.userRepository.findByEmail(employee.email);
                        if (matchedUser)
                            return matchedUser;
                    }
                    if (employee.employeeId) {
                        const matchedUser = await this.userRepository.findByEmployeeId(employee.employeeId, employee.projectId);
                        if (matchedUser)
                            return matchedUser;
                    }
                    if (employee.phoneNumber) {
                        const matchedUser = await this.userRepository.findByPhoneNumber(employee.phoneNumber);
                        if (matchedUser)
                            return matchedUser;
                    }
                }
            }
            catch {
                // In-memory or disconnected test execution fallback
            }
        }
        return null;
    }
}
exports.IdentifierResolverService = IdentifierResolverService;
//# sourceMappingURL=identifier-resolver.service.js.map