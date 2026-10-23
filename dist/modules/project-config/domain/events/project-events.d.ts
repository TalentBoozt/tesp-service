import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export declare class ProjectCreatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "PROJECT_CREATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(projectId: string, payload: Record<string, any>);
}
export declare class ProjectUpdatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "PROJECT_UPDATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(projectId: string, payload: Record<string, any>);
}
