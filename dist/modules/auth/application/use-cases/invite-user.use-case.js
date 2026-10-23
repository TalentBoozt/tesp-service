"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteUserUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_entity_1 = require("../../domain/entities/user.entity");
const mongo_user_repository_1 = require("../../infrastructure/persistence/mongo-user.repository");
const bcrypt_hasher_service_1 = require("../../infrastructure/services/bcrypt-hasher.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const system_email_service_1 = require("../../../../shared/infrastructure/email/system-email.service");
class InviteUserUseCase {
    userRepository;
    hasher;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository(), hasher = new bcrypt_hasher_service_1.BcryptHasherService()) {
        this.userRepository = userRepository;
        this.hasher = hasher;
    }
    async execute(req) {
        const callerRole = (0, auth_middleware_1.normalizeUserRole)(req.inviterRole);
        // Only SUPER_ADMIN, CONSULTANT_DAASH, or ORG_ADMIN can invite
        const allowedInviterRoles = [auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN];
        if (!allowedInviterRoles.includes(callerRole)) {
            throw {
                status: 403,
                type: 'https://tesp-api.talnova.io/errors/forbidden',
                title: 'Forbidden',
                detail: 'You are not authorized to invite new enterprise users.',
            };
        }
        const email = (req.email || '').trim().toLowerCase();
        if (!email || !user_entity_1.UserEntity.EMAIL_REGEX.test(email)) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'Valid email address is required.',
            };
        }
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw {
                status: 409,
                type: 'https://tesp-api.talnova.io/errors/conflict',
                title: 'User Already Exists',
                detail: `User with email '${email}' is already registered.`,
            };
        }
        const temporaryPassword = `Temp-${crypto_1.default.randomBytes(6).toString('hex')}!`;
        const passwordHash = await this.hasher.hashPassword(temporaryPassword);
        const inviteToken = crypto_1.default.randomBytes(24).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
        const newUser = new user_entity_1.UserEntity({
            userId,
            email,
            passwordHash,
            firstName: req.firstName || email.split('@')[0],
            lastName: req.lastName || '',
            role: req.role,
            firmId: req.firmId,
            authorizedProjectIds: [req.projectId],
            primaryProjectId: req.projectId,
            isActive: true,
            isEmailVerified: false,
            passwordResetToken: inviteToken,
            passwordResetExpires: expires,
        });
        await this.userRepository.save(newUser);
        const loginUrl = `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/login`;
        await system_email_service_1.systemEmailService.sendUserInvitationEmail({
            to: newUser.email,
            firstName: newUser.firstName,
            role: String(req.role),
            projectName: req.projectId,
            temporaryPassword,
            loginUrl,
        }).catch((err) => console.error('[InviteUser] Failed to send user invitation email:', err));
        return {
            success: true,
            user: newUser.toJSON(),
            inviteToken,
        };
    }
}
exports.InviteUserUseCase = InviteUserUseCase;
//# sourceMappingURL=invite-user.use-case.js.map