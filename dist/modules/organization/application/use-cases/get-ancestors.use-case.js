"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAncestorsUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetAncestorsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(projectId, nodeId) {
        const node = await this.repository.findByNodeId(projectId, nodeId);
        if (!node || node.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization node '${nodeId}' was not found.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        return await this.repository.findAncestors(projectId, node.path);
    }
}
exports.GetAncestorsUseCase = GetAncestorsUseCase;
//# sourceMappingURL=get-ancestors.use-case.js.map