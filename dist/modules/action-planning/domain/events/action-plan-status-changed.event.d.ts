import { ActionPlanStatus } from '../entities/action-plan.entity';
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
export declare class ActionPlanStatusChangedEvent {
    readonly payload: ActionPlanStatusChangedEventPayload;
    constructor(payload: Omit<ActionPlanStatusChangedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
