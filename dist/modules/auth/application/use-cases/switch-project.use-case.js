"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchProjectUseCase = void 0;
const mongo_user_repository_1 = require("../../infrastructure/persistence/mongo-user.repository");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class SwitchProjectUseCase {
    userRepository;
    constructor(userRepository = new mongo_user_repository_1.MongoUserRepository()) {
        this.userRepository = userRepository;
    }
    async execute(request) {
        const { userId, targetProjectId } = request;
        if (!targetProjectId) {
            throw {
                status: 400,
                type: 'https://tesp-api.talnova.io/errors/bad-request',
                title: 'Bad Request',
                detail: 'targetProjectId is required.',
            };
        }
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw {
                status: 404,
                type: 'https://tesp-api.talnova.io/errors/user-not-found',
                title: 'User Not Found',
                detail: `User '${userId}' could not be located.`,
            };
        }
        if (!user.isAuthorizedForProject(targetProjectId)) {
            throw {
                status: 403,
                type: 'https://tesp-api.talnova.io/errors/tenant-access-denied',
                title: 'Forbidden',
                detail: `Access denied. User '${user.email}' is not authorized to access tenant workspace '${targetProjectId}'.`,
            };
        }
        const token = (0, auth_middleware_1.generateToken)({
            userId: user.userId,
            role: user.role,
            projectId: targetProjectId,
            mustChangePassword: user.mustChangePassword,
            email: user.email,
            employeeId: user.employeeId,
            authorizedProjectIds: user.authorizedProjectIds,
        });
        return {
            token,
            projectId: targetProjectId,
            user: {
                id: user.userId,
                email: user.email,
                role: user.role,
                projectId: targetProjectId,
            },
        };
    }
}
exports.SwitchProjectUseCase = SwitchProjectUseCase;
//# sourceMappingURL=switch-project.use-case.js.map