"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const mongo_user_repository_1 = require("../../infrastructure/persistence/mongo-user.repository");
const bcrypt_hasher_service_1 = require("../../infrastructure/services/bcrypt-hasher.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
class ChangePasswordUseCase {
    userRepository;
    hasher;
    static PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?]).{8,128}$/;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository(), hasher = new bcrypt_hasher_service_1.BcryptHasherService()) {
        this.userRepository = userRepository;
        this.hasher = hasher;
    }
    async execute(request) {
        const { userId, currentPassword, newPassword, confirmPassword } = request;
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'Current password, new password, and confirmation are required.',
            };
        }
        if (newPassword !== confirmPassword) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'New password and confirmation do not match.',
            };
        }
        if (!ChangePasswordUseCase.PASSWORD_COMPLEXITY_REGEX.test(newPassword)) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/weak-password',
                title: 'Weak Password',
                detail: 'Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            };
        }
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw {
                status: 404,
                type: 'https://tesp-api.talnova.io/errors/user-not-found',
                title: 'Not Found',
                detail: 'User account not found.',
            };
        }
        const isCurrentValid = await this.hasher.verifyPassword(currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            throw {
                status: 401,
                type: 'https://tesp-api.talnova.io/errors/unauthorized',
                title: 'Unauthorized',
                detail: 'Current password does not match.',
            };
        }
        if (currentPassword === newPassword) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'New password cannot be identical to your current password.',
            };
        }
        const newPasswordHash = await this.hasher.hashPassword(newPassword);
        user.completePasswordChange(newPasswordHash);
        await this.userRepository.save(user);
        const activeProjectId = request.projectId || user.primaryProjectId;
        const freshToken = (0, auth_middleware_1.generateToken)({
            userId: user.userId,
            role: user.role,
            projectId: activeProjectId,
            mustChangePassword: false,
        });
        await audit_logger_1.AuditLogger.log({
            projectId: activeProjectId,
            action: 'AUTH_PASSWORD_CHANGED',
            actorId: user.userId,
            actorRole: user.role,
            resource: 'AUTH:CHANGE_PASSWORD',
            details: {
                userId: user.userId,
                email: user.email,
            },
        });
        return {
            success: true,
            message: 'Password updated successfully.',
            token: freshToken,
            mustChangePassword: false,
        };
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
//# sourceMappingURL=change-password.use-case.js.map