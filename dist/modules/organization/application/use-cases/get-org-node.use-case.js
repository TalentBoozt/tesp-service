"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrgNodeUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetOrgNodeUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(projectId, nodeId) {
        const node = await this.repository.findByNodeId(projectId, nodeId);
        if (!node || node.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization node '${nodeId}' was not found.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        return node;
    }
}
exports.GetOrgNodeUseCase = GetOrgNodeUseCase;
//# sourceMappingURL=get-org-node.use-case.js.map