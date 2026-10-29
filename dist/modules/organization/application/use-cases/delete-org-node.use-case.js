"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOrgNodeUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employee_repository_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.repository");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const org_node_events_1 = require("../../domain/events/org-node.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class DeleteOrgNodeUseCase {
    repository;
    eventBus;
    employeeRepo;
    constructor(repository, employeeRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.eventBus = eventBus;
        if (employeeRepo) {
            this.employeeRepo = employeeRepo;
        }
        else if (mongoose_1.default.connection?.readyState === 1) {
            try {
                this.employeeRepo = new employee_repository_1.EmployeeMongoRepository();
            }
            catch {
                // Fallback for isolated unit tests without mongoose connection
            }
        }
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
        // FR-ORG-006: Deletion Integrity Guard - verify node does not contain active assigned employees
        if (this.employeeRepo?.countActiveByNodeId) {
            const activeEmployeeCount = await this.employeeRepo.countActiveByNodeId(projectId, nodeId);
            if (activeEmployeeCount > 0) {
                throw new error_middleware_1.AppError(409, `Cannot delete organization node '${nodeId}' because ${activeEmployeeCount} active employee(s) are assigned to this node. Reassign employees before deletion.`, 'https://tesp-api.talnova.io/errors/node-has-employees');
            }
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