"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmployeeUseCase = void 0;
const employee_entity_1 = require("../../domain/entities/employee.entity");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const employee_events_1 = require("../../domain/events/employee.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const employee_auth_sync_service_1 = require("../../infrastructure/services/employee-auth-sync.service");
class CreateEmployeeUseCase {
    employeeRepo;
    orgNodeRepo;
    eventBus;
    constructor(employeeRepo, orgNodeRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.employeeRepo = employeeRepo;
        this.orgNodeRepo = orgNodeRepo;
        this.eventBus = eventBus;
    }
    async execute(props, actorContext) {
        if (props.employeeId) {
            const exists = await this.employeeRepo.existsByEmployeeId(props.projectId, props.employeeId);
            if (exists) {
                throw new error_middleware_1.AppError(400, `Employee with ID '${props.employeeId}' already exists in project '${props.projectId}'.`, 'https://tesp-api.talnova.io/errors/duplicate-employee');
            }
        }
        // VR-EMP-003: Validate Primary Node Association against FEAT-002
        if (this.orgNodeRepo) {
            const orgNodeExists = await this.orgNodeRepo.existsByNodeId(props.projectId, props.nodeId);
            if (!orgNodeExists) {
                throw new error_middleware_1.AppError(400, `Assigned Organization Node ID '${props.nodeId}' does not exist in project '${props.projectId}'.`, 'https://tesp-api.talnova.io/errors/node-not-found');
            }
            if (props.matrixNodeIds && props.matrixNodeIds.length > 0) {
                for (const matrixId of props.matrixNodeIds) {
                    const matrixExists = await this.orgNodeRepo.existsByNodeId(props.projectId, matrixId);
                    if (!matrixExists) {
                        throw new error_middleware_1.AppError(400, `Assigned Matrix Organization Node ID '${matrixId}' does not exist.`, 'https://tesp-api.talnova.io/errors/node-not-found');
                    }
                }
            }
        }
        const employee = new employee_entity_1.EmployeeEntity(props);
        const saved = await this.employeeRepo.save(employee);
        // Provision corresponding user authentication account (PROMPT-29)
        await employee_auth_sync_service_1.EmployeeAuthSyncService.getInstance().provisionUserForEmployee(saved.toJSON(), undefined, actorContext);
        // Event
        this.eventBus.publish(new employee_events_1.EmployeeCreatedEvent(saved.employeeId, saved.toJSON()));
        // Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId: saved.projectId,
                action: 'EMPLOYEE_CREATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/employees/${saved.employeeId}`,
                details: { employeeId: saved.employeeId, nodeId: saved.nodeId, status: saved.status },
            });
        }
        return saved;
    }
}
exports.CreateEmployeeUseCase = CreateEmployeeUseCase;
//# sourceMappingURL=create-employee.use-case.js.map