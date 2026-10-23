"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const employee_events_1 = require("../../domain/events/employee.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const employee_auth_sync_service_1 = require("../../infrastructure/services/employee-auth-sync.service");
class UpdateEmployeeUseCase {
    employeeRepo;
    orgNodeRepo;
    eventBus;
    constructor(employeeRepo, orgNodeRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.employeeRepo = employeeRepo;
        this.orgNodeRepo = orgNodeRepo;
        this.eventBus = eventBus;
    }
    async execute(projectId, employeeId, params, actorContext) {
        const employee = await this.employeeRepo.findByEmployeeId(projectId, employeeId);
        if (!employee || employee.isDeleted) {
            throw new error_middleware_1.AppError(404, `Employee with ID '${employeeId}' was not found.`, 'https://tesp-api.talnova.io/errors/employee-not-found');
        }
        if (params.nodeId && this.orgNodeRepo) {
            const nodeExists = await this.orgNodeRepo.existsByNodeId(projectId, params.nodeId);
            if (!nodeExists) {
                throw new error_middleware_1.AppError(400, `Assigned Organization Node ID '${params.nodeId}' does not exist.`, 'https://tesp-api.talnova.io/errors/node-not-found');
            }
        }
        employee.updateDetails(params);
        const saved = await this.employeeRepo.save(employee);
        // Event
        this.eventBus.publish(new employee_events_1.EmployeeUpdatedEvent(employeeId, saved.toJSON()));
        // Sync corresponding user authentication account (PROMPT-29)
        await employee_auth_sync_service_1.EmployeeAuthSyncService.getInstance().provisionUserForEmployee(saved.toJSON(), undefined, actorContext);
        // Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'EMPLOYEE_UPDATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/employees/${employeeId}`,
                details: params,
            });
        }
        return saved;
    }
}
exports.UpdateEmployeeUseCase = UpdateEmployeeUseCase;
//# sourceMappingURL=update-employee.use-case.js.map