"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrgNodeUseCase = void 0;
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class UpdateOrgNodeUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(projectId, nodeId, params, actorContext) {
        const node = await this.repository.findByNodeId(projectId, nodeId);
        if (!node || node.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization node '${nodeId}' was not found.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        node.updateDetails(params);
        const saved = await this.repository.save(node);
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'ORG_NODE_UPDATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/nodes/${nodeId}`,
                details: params,
            });
        }
        return saved;
    }
}
exports.UpdateOrgNodeUseCase = UpdateOrgNodeUseCase;
//# sourceMappingURL=update-org-node.use-case.js.map