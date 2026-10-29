"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportEmployeesUseCase = void 0;
const employee_entity_1 = require("../../domain/entities/employee.entity");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const employee_events_1 = require("../../domain/events/employee.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const employee_auth_sync_service_1 = require("../../infrastructure/services/employee-auth-sync.service");
class BulkImportEmployeesUseCase {
    employeeRepo;
    eventBus;
    BATCH_SIZE = 5000;
    constructor(employeeRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.employeeRepo = employeeRepo;
        this.eventBus = eventBus;
    }
    async execute(projectId, records, options, actorContext) {
        const summary = {
            totalRecords: records.length,
            inserted: 0,
            updated: 0,
            terminated: 0,
            failed: 0,
            errors: [],
        };
        const validEmployees = [];
        const processedEmployeeIds = [];
        records.forEach((rec, idx) => {
            try {
                const entity = new employee_entity_1.EmployeeEntity({
                    ...rec,
                    projectId,
                });
                validEmployees.push(entity);
                processedEmployeeIds.push(entity.employeeId);
            }
            catch (err) {
                summary.failed++;
                summary.errors.push({
                    line: idx + 1,
                    employeeId: rec.employeeId,
                    error: err.message || 'Validation error',
                });
            }
        });
        // Batch upsert in chunks of 5,000
        for (let i = 0; i < validEmployees.length; i += this.BATCH_SIZE) {
            const batch = validEmployees.slice(i, i + this.BATCH_SIZE);
            const res = await this.employeeRepo.bulkUpsert(batch);
            summary.inserted += res.inserted;
            summary.updated += res.updated;
        }
        // High-Scale UserModel Authentication Sync (PROMPT-29)
        if (validEmployees.length > 0) {
            const authSyncResult = await employee_auth_sync_service_1.EmployeeAuthSyncService.getInstance().bulkSyncUsersForEmployees(projectId, validEmployees.map((e) => e.toJSON()), undefined, actorContext);
            summary.authAccountsProvisioned = authSyncResult.authAccountsProvisioned;
        }
        else {
            summary.authAccountsProvisioned = 0;
        }
        // Perform Delta Matching & Auto-Termination if requested (FR-EMP-004, TC-EMP-001)
        if (options?.autoTerminateMissing && processedEmployeeIds.length > 0) {
            const terminatedCount = await this.employeeRepo.terminateMissingInList(projectId, processedEmployeeIds);
            summary.terminated = terminatedCount;
        }
        // Publish Event
        await this.eventBus.publish(new employee_events_1.EmployeeBulkImportCompletedEvent(projectId, {
            projectId,
            totalRecords: summary.totalRecords,
            inserted: summary.inserted,
            updated: summary.updated,
            terminated: summary.terminated,
        }));
        // Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'EMPLOYEE_BULK_IMPORT',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/employees/bulk-import`,
                details: {
                    total: summary.totalRecords,
                    inserted: summary.inserted,
                    updated: summary.updated,
                    terminated: summary.terminated,
                },
            });
        }
        return summary;
    }
}
exports.BulkImportEmployeesUseCase = BulkImportEmployeesUseCase;
//# sourceMappingURL=bulk-import-employees.use-case.js.map