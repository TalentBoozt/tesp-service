import { ActionPlanStatus } from '../entities/action-plan.entity';
import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface ActionPlanStatusChangedEventPayload {
    eventId: string;
    eventType: 'ACTION_PLAN_STATUS_CHANGED';
    projectId: string;
    actionPlanId: string;
    campaignId: string;
    nodeId: string;
    oldStatus: ActionPlanStatus;
    newStatus: ActionPlanStatus;
    actorId: string;
    timestamp: string;
}
export declare class ActionPlanStatusChangedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "ACTION_PLAN_STATUS_CHANGED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: ActionPlanStatusChangedEventPayload;
    constructor(payload: Omit<ActionPlanStatusChangedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
