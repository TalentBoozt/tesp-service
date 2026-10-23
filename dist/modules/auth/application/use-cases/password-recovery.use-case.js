"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordRecoveryUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongo_user_repository_1 = require("../../infrastructure/persistence/mongo-user.repository");
const bcrypt_hasher_service_1 = require("../../infrastructure/services/bcrypt-hasher.service");
const system_email_service_1 = require("../../../../shared/infrastructure/email/system-email.service");
class PasswordRecoveryUseCase {
    userRepository;
    hasher;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository(), hasher = new bcrypt_hasher_service_1.BcryptHasherService()) {
        this.userRepository = userRepository;
        this.hasher = hasher;
    }
    async requestPasswordReset(email) {
        const normalized = (email || '').trim().toLowerCase();
        if (!normalized) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'Email is required.',
            };
        }
        const user = await this.userRepository.findByEmail(normalized);
        // Generic response to prevent user enumeration
        if (!user) {
            return {
                success: true,
                message: 'If the email exists in our directory, a secure recovery link has been dispatched.',
            };
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.setPasswordResetToken(token, expires);
        await this.userRepository.save(user);
        const resetUrl = `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/reset-password?token=${token}`;
        await system_email_service_1.systemEmailService.sendPasswordResetEmail({
            to: user.email,
            firstName: user.firstName,
            resetToken: token,
            resetUrl,
        }).catch((err) => console.error('[PasswordRecovery] Failed to dispatch reset email:', err));
        return {
            success: true,
            message: 'If the email exists in our directory, a secure recovery link has been dispatched.',
            debugResetToken: process.env.NODE_ENV !== 'production' ? token : undefined,
        };
    }
    async resetPassword(token, newPlainPassword) {
        if (!token || !newPlainPassword) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'Reset token and new password are required.',
            };
        }
        if (newPlainPassword.length < 8) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/weak-password',
                title: 'Weak Password',
                detail: 'Password must be at least 8 characters long.',
            };
        }
        const user = await this.userRepository.findByResetToken(token);
        if (!user) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/invalid-reset-token',
                title: 'Invalid or Expired Token',
                detail: 'The password reset token is invalid or has expired.',
            };
        }
        const newHash = await this.hasher.hashPassword(newPlainPassword);
        user.updatePassword(newHash);
        await this.userRepository.save(user);
        return {
            success: true,
            message: 'Password successfully updated. You may now log in with your new credentials.',
        };
    }
}
exports.PasswordRecoveryUseCase = PasswordRecoveryUseCase;
//# sourceMappingURL=password-recovery.use-case.js.map