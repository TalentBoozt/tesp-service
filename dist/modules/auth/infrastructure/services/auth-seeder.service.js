"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSeederService = exports.DEFAULT_PRODUCTION_SEED_USERS = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const bcrypt_hasher_service_1 = require("./bcrypt-hasher.service");
const mongo_user_repository_1 = require("../persistence/mongo-user.repository");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
exports.DEFAULT_PRODUCTION_SEED_USERS = [
    {
        userId: 'USR-SUPERADMIN',
        email: 'superadmin@talnova.com',
        plainPassword: 'Password@123!',
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
        plainPassword: 'Password@123!',
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
        for (const seed of exports.DEFAULT_PRODUCTION_SEED_USERS) {
            const existing = await this.userRepository.findByEmail(seed.email);
            if (!existing || forceOverwrite) {
                const passwordHash = await this.hasher.hashPassword(seed.plainPassword);
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