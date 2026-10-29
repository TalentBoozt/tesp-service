import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface SurveyRemindersDispatchedEventPayload {
    eventId: string;
    eventType: 'SURVEY_REMINDERS_DISPATCHED';
    projectId: string;
    campaignId: string;
    uncompletedCount: number;
    timestamp: string;
}
export declare class SurveyRemindersDispatchedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "SURVEY_REMINDERS_DISPATCHED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: SurveyRemindersDispatchedEventPayload;
    constructor(payload: Omit<SurveyRemindersDispatchedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
