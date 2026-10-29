import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface MilestoneNudgeEventPayload {
    eventId: string;
    eventType: 'MILESTONE_NUDGE';
    projectId: string;
    actionPlanId: string;
    campaignId: string;
    milestoneId: string;
    milestoneTitle: string;
    dueDate: Date;
    assigneeId: string;
    timestamp: string;
}
export declare class MilestoneNudgeEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "MILESTONE_NUDGE";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: MilestoneNudgeEventPayload;
    constructor(payload: Omit<MilestoneNudgeEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
