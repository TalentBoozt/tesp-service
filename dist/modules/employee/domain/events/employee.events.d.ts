import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export declare class EmployeeCreatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "EMPLOYEE_CREATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(employeeId: string, payload: Record<string, any>);
}
export declare class EmployeeUpdatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "EMPLOYEE_UPDATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(employeeId: string, payload: Record<string, any>);
}
export declare class EmployeeTerminatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "EMPLOYEE_TERMINATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(employeeId: string, payload: Record<string, any>);
}
export declare class EmployeeBulkImportCompletedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "EMPLOYEE_BULK_IMPORT_COMPLETED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(projectId: string, payload: {
        projectId: string;
        totalRecords: number;
        inserted: number;
        updated: number;
        terminated: number;
    });
}
