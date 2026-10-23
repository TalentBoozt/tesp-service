"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminateEmployeeUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const employee_events_1 = require("../../domain/events/employee.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const employee_auth_sync_service_1 = require("../../infrastructure/services/employee-auth-sync.service");
class TerminateEmployeeUseCase {
    employeeRepo;
    eventBus;
    constructor(employeeRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.employeeRepo = employeeRepo;
        this.eventBus = eventBus;
    }
    async execute(projectId, employeeId, actorContext) {
        const employee = await this.employeeRepo.findByEmployeeId(projectId, employeeId);
        if (!employee || employee.isDeleted) {
            throw new error_middleware_1.AppError(404, `Employee with ID '${employeeId}' was not found.`, 'https://tesp-api.talnova.io/errors/employee-not-found');
        }
        employee.terminate();
        await this.employeeRepo.save(employee);
        // Deactivate corresponding user account (PROMPT-29)
        await employee_auth_sync_service_1.EmployeeAuthSyncService.getInstance().deactivateUserForEmployee(projectId, employeeId);
        this.eventBus.publish(new employee_events_1.EmployeeTerminatedEvent(employeeId, { projectId, employeeId }));
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'EMPLOYEE_TERMINATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/employees/${employeeId}`,
            });
        }
        return true;
    }
}
exports.TerminateEmployeeUseCase = TerminateEmployeeUseCase;
//# sourceMappingURL=terminate-employee.use-case.js.map