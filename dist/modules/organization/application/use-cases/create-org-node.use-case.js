"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrgNodeUseCase = void 0;
const org_node_entity_1 = require("../../domain/entities/org-node.entity");
const path_calculator_service_1 = require("../../domain/services/path-calculator.service");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const org_node_events_1 = require("../../domain/events/org-node.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class CreateOrgNodeUseCase {
    repository;
    eventBus;
    constructor(repository, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async execute(props, actorContext) {
        const exists = await this.repository.existsByNodeId(props.projectId, props.nodeId);
        if (exists) {
            throw new error_middleware_1.AppError(400, `Organization node with ID '${props.nodeId}' already exists in project '${props.projectId}'.`, 'https://tesp-api.talnova.io/errors/duplicate-node');
        }
        let parentPath = null;
        if (props.parentId) {
            const parent = await this.repository.findByNodeId(props.projectId, props.parentId);
            if (!parent || parent.isDeleted) {
                throw new error_middleware_1.AppError(400, `Parent Node '${props.parentId}' does not exist or has been archived.`, 'https://tesp-api.talnova.io/errors/parent-node-not-found');
            }
            parentPath = parent.path;
        }
        const { path, depth } = path_calculator_service_1.PathCalculatorService.computePathAndDepth(props.nodeId, parentPath);
        const node = new org_node_entity_1.OrgNodeEntity({
            ...props,
            path,
            depth,
        });
        const savedNode = await this.repository.save(node);
        // Domain Event
        this.eventBus.publish(new org_node_events_1.OrgNodeCreatedEvent(savedNode.nodeId, savedNode.toJSON()));
        // Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId: savedNode.projectId,
                action: 'ORG_NODE_CREATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/nodes/${savedNode.nodeId}`,
                details: { nodeId: savedNode.nodeId, name: savedNode.name, path: savedNode.path, depth: savedNode.depth },
            });
        }
        return savedNode;
    }
}
exports.CreateOrgNodeUseCase = CreateOrgNodeUseCase;
//# sourceMappingURL=create-org-node.use-case.js.map