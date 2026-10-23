"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSubTreeUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetSubTreeUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(projectId, nodeId) {
        const rootNode = await this.repository.findByNodeId(projectId, nodeId);
        if (!rootNode || rootNode.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization root node '${nodeId}' was not found.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        return await this.repository.findSubTree(projectId, rootNode.path);
    }
}
exports.GetSubTreeUseCase = GetSubTreeUseCase;
//# sourceMappingURL=get-sub-tree.use-case.js.map