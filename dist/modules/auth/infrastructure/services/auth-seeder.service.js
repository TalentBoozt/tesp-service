"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSeederService = exports.DEFAULT_PRODUCTION_SEED_USERS = void 0;
exports.getInitialSuperAdminPassword = getInitialSuperAdminPassword;
const crypto_1 = __importDefault(require("crypto"));
const user_entity_1 = require("../../domain/entities/user.entity");
const bcrypt_hasher_service_1 = require("./bcrypt-hasher.service");
const mongo_user_repository_1 = require("../persistence/mongo-user.repository");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function getInitialSuperAdminPassword() {
    if (process.env.INITIAL_SUPERADMIN_PASSWORD) {
        return process.env.INITIAL_SUPERADMIN_PASSWORD;
    }
    if (process.env.NODE_ENV === 'production') {
        const generated = crypto_1.default.randomBytes(12).toString('base64') + '!A9';
        console.warn(`[SECURITY WARNING] INITIAL_SUPERADMIN_PASSWORD not set in production. Generated temporary credential: ${generated}`);
        return generated;
    }
    return 'Password@123!';
}
exports.DEFAULT_PRODUCTION_SEED_USERS = [
    {
        userId: 'USR-SUPERADMIN',
        email: 'superadmin@talnova.com',
        firstName: 'Platform',
        lastName: 'SuperAdmin',
        role: auth_middleware_1.UserRole.SUPER_ADMIN,
        authorizedProjectIds: ['*'],
        primaryProjectId: 'PRJ-99201',
        mustChangePassword: false,
    },
    {
        userId: 'USR-SUPERADMIN-IO',
        email: 'superadmin@talnova.io',
        firstName: 'Platform',
        lastName: 'SuperAdmin',
        role: auth_middleware_1.UserRole.SUPER_ADMIN,
        authorizedProjectIds: ['*'],
        primaryProjectId: 'PRJ-99201',
        mustChangePassword: false,
    },
];
class AuthSeederService {
    userRepository;
    hasher;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository(), hasher = new bcrypt_hasher_service_1.BcryptHasherService()) {
        this.userRepository = userRepository;
        this.hasher = hasher;
    }
    async seedDefaultUsers(forceOverwrite = false) {
        const isProduction = process.env.NODE_ENV === 'production';
        const allowDemo = process.env.ALLOW_DEMO_SEEDING === 'true';
        if (isProduction && !allowDemo) {
            console.log('[AuthSeeder] Production mode active without ALLOW_DEMO_SEEDING=true. Skipping demo user accounts (PRJ-99201).');
            return;
        }
        const superAdminPassword = getInitialSuperAdminPassword();
        for (const seed of exports.DEFAULT_PRODUCTION_SEED_USERS) {
            const existing = await this.userRepository.findByEmail(seed.email);
            if (!existing || forceOverwrite) {
                const passwordToHash = seed.plainPassword || superAdminPassword;
                const passwordHash = await this.hasher.hashPassword(passwordToHash);
                const user = new user_entity_1.UserEntity({
                    userId: seed.userId,
                    email: seed.email,
                    passwordHash,
                    firstName: seed.firstName,
                    lastName: seed.lastName,
                    role: seed.role,
                    firmId: seed.firmId,
                    authorizedProjectIds: seed.authorizedProjectIds,
                    primaryProjectId: seed.primaryProjectId,
                    mustChangePassword: seed.mustChangePassword !== undefined ? seed.mustChangePassword : false,
                    failedLoginAttempts: 0,
                    isActive: true,
                    isEmailVerified: true,
                });
                await this.userRepository.save(user);
            }
        }
    }
    async ensureDefaultUsersExist() {
        const userCount = await this.userRepository.count();
        if (userCount === 0) {
            await this.seedDefaultUsers(false);
        }
    }
}
exports.AuthSeederService = AuthSeederService;
//# sourceMappingURL=auth-seeder.service.js.map