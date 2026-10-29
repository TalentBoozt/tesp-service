import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface MilestoneOverdueEscalationEventPayload {
    eventId: string;
    eventType: 'MILESTONE_OVERDUE_ESCALATION';
    projectId: string;
    actionPlanId: string;
    campaignId: string;
    milestoneId: string;
    milestoneTitle: string;
    dueDate: Date;
    assigneeId: string;
    approverId?: string;
    timestamp: string;
}
export declare class MilestoneOverdueEscalationEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "MILESTONE_OVERDUE_ESCALATION";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: MilestoneOverdueEscalationEventPayload;
    constructor(payload: Omit<MilestoneOverdueEscalationEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
