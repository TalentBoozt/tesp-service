"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOrgNodeUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const org_node_events_1 = require("../../domain/events/org-node.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class DeleteOrgNodeUseCase {
    repository;
    eventBus;
    constructor(repository, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async execute(projectId, nodeId, actorContext) {
        const node = await this.repository.findByNodeId(projectId, nodeId);
        if (!node || node.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization node '${nodeId}' was not found.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        // FR-ORG-006: Deletion Integrity Guard - verify node does not contain active children
        const hasChildren = await this.repository.hasActiveChildren(projectId, nodeId);
        if (hasChildren) {
            throw new error_middleware_1.AppError(400, `Cannot delete node '${nodeId}' because it contains active child sub-nodes. Re-parent or delete child nodes first.`, 'https://tesp-api.talnova.io/errors/node-has-children');
        }
        const success = await this.repository.softDelete(projectId, nodeId);
        if (success) {
            this.eventBus.publish(new org_node_events_1.OrgNodeArchivedEvent(nodeId, { projectId, nodeId }));
            if (actorContext) {
                await audit_logger_1.AuditLogger.log({
                    projectId,
                    action: 'ORG_NODE_ARCHIVED',
                    actorId: actorContext.actorId,
                    actorRole: actorContext.actorRole,
                    resource: `/api/v1/nodes/${nodeId}`,
                });
            }
        }
        return success;
    }
}
exports.DeleteOrgNodeUseCase = DeleteOrgNodeUseCase;
//# sourceMappingURL=delete-org-node.use-case.js.map