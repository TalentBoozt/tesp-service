import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export declare class OrgNodeCreatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "ORG_NODE_CREATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(nodeId: string, payload: Record<string, any>);
}
export declare class OrgNodeMovedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "ORG_NODE_MOVED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(nodeId: string, payload: {
        projectId: string;
        nodeId: string;
        oldPath: string;
        newPath: string;
    });
}
export declare class OrgNodeArchivedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "ORG_NODE_ARCHIVED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(nodeId: string, payload: Record<string, any>);
}
