"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveOrgNodeUseCase = void 0;
const cycle_detection_guard_1 = require("../../domain/services/cycle-detection.guard");
const path_calculator_service_1 = require("../../domain/services/path-calculator.service");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const org_node_events_1 = require("../../domain/events/org-node.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class MoveOrgNodeUseCase {
    repository;
    eventBus;
    constructor(repository, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async execute(projectId, nodeId, newParentId, actorContext) {
        const targetNode = await this.repository.findByNodeId(projectId, nodeId);
        if (!targetNode || targetNode.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization node '${nodeId}' was not found in project '${projectId}'.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        let newParentNode = null;
        if (newParentId) {
            newParentNode = await this.repository.findByNodeId(projectId, newParentId);
            if (!newParentNode || newParentNode.isDeleted) {
                throw new error_middleware_1.AppError(400, `Target new parent node '${newParentId}' does not exist.`, 'https://tesp-api.talnova.io/errors/parent-node-not-found');
            }
        }
        // 1. Validate Cycle Prevention Guard (VR-ORG-004)
        try {
            cycle_detection_guard_1.CycleDetectionGuard.validateMove(targetNode, newParentNode);
        }
        catch (err) {
            throw new error_middleware_1.AppError(409, err.message || 'Circular hierarchy move detected', 'https://tesp-api.talnova.io/errors/circular-hierarchy-move');
        }
        const oldPath = targetNode.path;
        const { path: newPath } = path_calculator_service_1.PathCalculatorService.computePathAndDepth(targetNode.nodeId, newParentNode ? newParentNode.path : null);
        if (oldPath === newPath) {
            // No movement required
            return targetNode;
        }
        // 2. Update target node and descendants atomically (GAP-018)
        let savedNode;
        if (typeof this.repository.moveNode === 'function') {
            savedNode = await this.repository.moveNode(projectId, nodeId, newParentId, oldPath, newPath);
        }
        else {
            targetNode.setPathAndParent(newParentId, newParentNode ? newParentNode.path : undefined);
            savedNode = await this.repository.save(targetNode);
            await this.repository.bulkUpdateSubTreePaths(projectId, oldPath, newPath);
        }
        // 4. Domain Event
        await this.eventBus.publish(new org_node_events_1.OrgNodeMovedEvent(nodeId, {
            projectId,
            nodeId,
            oldPath,
            newPath,
        }));
        // 5. Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'ORG_NODE_MOVED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/nodes/${nodeId}/move`,
                details: { nodeId, newParentId, oldPath, newPath },
            });
        }
        return savedNode;
    }
}
exports.MoveOrgNodeUseCase = MoveOrgNodeUseCase;
//# sourceMappingURL=move-org-node.use-case.js.map