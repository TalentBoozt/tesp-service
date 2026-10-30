"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongo_user_repository_1 = require("../../infrastructure/persistence/mongo-user.repository");
const bcrypt_hasher_service_1 = require("../../infrastructure/services/bcrypt-hasher.service");
const identifier_resolver_service_1 = require("../../infrastructure/services/identifier-resolver.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const consulting_firm_schema_1 = require("../../../consultant/infrastructure/persistence/mongoose/consulting-firm.schema");
class LoginUseCase {
    userRepository;
    hasher;
    resolver;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository(), hasher = new bcrypt_hasher_service_1.BcryptHasherService(), resolver = new identifier_resolver_service_1.IdentifierResolverService(userRepository)) {
        this.userRepository = userRepository;
        this.hasher = hasher;
        this.resolver = resolver;
    }
    async execute(request) {
        const rawIdentifier = (request.identifier || request.email || '').trim();
        const rawPassword = request.password || '';
        if (!rawIdentifier || !rawPassword) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'Email and password are required for authentication.',
            };
        }
        const user = await this.resolver.findUserByIdentifier(rawIdentifier, request.projectId);
        if (!user) {
            await audit_logger_1.AuditLogger.log({
                projectId: request.projectId || 'PRJ-GLOBAL',
                action: 'AUTH_LOGIN_FAILED',
                actorId: 'ANONYMOUS',
                actorRole: 'ANONYMOUS',
                resource: 'AUTH:LOGIN',
                details: { identifier: rawIdentifier, reason: 'USER_NOT_FOUND' },
            });
            throw {
                status: 401,
                type: 'https://tesp-api.talnova.io/errors/unauthorized',
                title: 'Unauthorized',
                detail: 'Invalid email or password.',
            };
        }
        if (!user.isActive) {
            throw {
                status: 403,
                type: 'https://tesp-api.talnova.io/errors/account-deactivated',
                title: 'Account Deactivated',
                detail: 'Your user account has been deactivated. Please contact your system administrator.',
            };
        }
        // Check account lockout status (5 consecutive failed attempts)
        if (user.isLockedOut()) {
            const remainingMs = (user.lockoutUntil?.getTime() || 0) - Date.now();
            const remainingMins = Math.max(1, Math.ceil(remainingMs / 60000));
            await audit_logger_1.AuditLogger.log({
                projectId: user.primaryProjectId,
                action: 'AUTH_LOGIN_LOCKED',
                actorId: user.userId,
                actorRole: user.role,
                resource: 'AUTH:LOGIN',
                details: { identifier: rawIdentifier, remainingMins },
            });
            throw {
                status: 423,
                type: 'https://tesp-api.talnova.io/errors/account-locked',
                title: 'Account Locked',
                detail: `Account temporarily locked due to consecutive failed attempts. Please try again in ${remainingMins} minute(s).`,
            };
        }
        const isMatch = await this.hasher.verifyPassword(rawPassword, user.passwordHash);
        if (!isMatch) {
            user.recordFailedLogin();
            await this.userRepository.save(user);
            await audit_logger_1.AuditLogger.log({
                projectId: user.primaryProjectId,
                action: 'AUTH_LOGIN_FAILED',
                actorId: user.userId,
                actorRole: user.role,
                resource: 'AUTH:LOGIN',
                details: {
                    identifier: rawIdentifier,
                    failedAttempts: user.failedLoginAttempts,
                    isLockedOut: user.isLockedOut(),
                },
            });
            if (user.isLockedOut()) {
                const remainingMs = (user.lockoutUntil?.getTime() || 0) - Date.now();
                const remainingMins = Math.max(1, Math.ceil(remainingMs / 60000));
                throw {
                    status: 423,
                    type: 'https://tesp-api.talnova.io/errors/account-locked',
                    title: 'Account Locked',
                    detail: `Account temporarily locked due to consecutive failed attempts. Please try again in ${remainingMins} minute(s).`,
                };
            }
            throw {
                status: 401,
                type: 'https://tesp-api.talnova.io/errors/unauthorized',
                title: 'Unauthorized',
                detail: 'Invalid email or password.',
            };
        }
        // Successful credentials verification
        user.recordSuccessfulLogin();
        await this.userRepository.save(user);
        // Determine active workspace context
        let activeProjectId = user.primaryProjectId;
        if (request.projectId && user.isAuthorizedForProject(request.projectId)) {
            activeProjectId = request.projectId;
        }
        // Resolve dynamic consulting firm context if user has an associated firm
        let firmName = undefined;
        if (user.firmId) {
            if (mongoose_1.default.connection?.readyState === 1) {
                try {
                    const firmDoc = await consulting_firm_schema_1.ConsultingFirmModel.findOne({ firmId: user.firmId }).lean();
                    if (firmDoc && firmDoc.name) {
                        firmName = firmDoc.name;
                    }
                    else {
                        firmName = 'Advisory Partner';
                    }
                }
                catch {
                    firmName = 'Advisory Partner';
                }
            }
            else {
                firmName = 'Advisory Partner';
            }
        }
        // Mint production signed JWT containing mustChangePassword and dynamic firm context
        const token = (0, auth_middleware_1.generateToken)({
            userId: user.userId,
            role: user.role,
            projectId: activeProjectId,
            mustChangePassword: user.mustChangePassword,
            email: user.email,
            employeeId: user.employeeId,
            authorizedProjectIds: user.authorizedProjectIds,
            firmId: user.firmId,
            firmName,
        });
        await audit_logger_1.AuditLogger.log({
            projectId: activeProjectId,
            action: 'AUTH_LOGIN_SUCCESS',
            actorId: user.userId,
            actorRole: user.role,
            resource: 'AUTH:LOGIN',
            details: {
                mustChangePassword: user.mustChangePassword,
                firmId: user.firmId,
            },
        });
        return {
            token,
            mustChangePassword: user.mustChangePassword,
            user: {
                id: user.userId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                projectId: activeProjectId,
                authorizedProjectIds: user.authorizedProjectIds,
                firmId: user.firmId,
                firmName,
                mustChangePassword: user.mustChangePassword,
                employeeId: user.employeeId,
                phoneNumber: user.phoneNumber,
            },
        };
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=login.use-case.js.map