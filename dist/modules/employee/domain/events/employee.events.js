"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeBulkImportCompletedEvent = exports.EmployeeTerminatedEvent = exports.EmployeeUpdatedEvent = exports.EmployeeCreatedEvent = void 0;
class EmployeeCreatedEvent {
    eventId;
    eventType = 'EMPLOYEE_CREATED';
    aggregateId;
    timestamp;
    payload;
    constructor(employeeId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = employeeId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.EmployeeCreatedEvent = EmployeeCreatedEvent;
class EmployeeUpdatedEvent {
    eventId;
    eventType = 'EMPLOYEE_UPDATED';
    aggregateId;
    timestamp;
    payload;
    constructor(employeeId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = employeeId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.EmployeeUpdatedEvent = EmployeeUpdatedEvent;
class EmployeeTerminatedEvent {
    eventId;
    eventType = 'EMPLOYEE_TERMINATED';
    aggregateId;
    timestamp;
    payload;
    constructor(employeeId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = employeeId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.EmployeeTerminatedEvent = EmployeeTerminatedEvent;
class EmployeeBulkImportCompletedEvent {
    eventId;
    eventType = 'EMPLOYEE_BULK_IMPORT_COMPLETED';
    aggregateId;
    timestamp;
    payload;
    constructor(projectId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = projectId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.EmployeeBulkImportCompletedEvent = EmployeeBulkImportCompletedEvent;
//# sourceMappingURL=employee.events.js.map