export interface SurveyRemindersDispatchedEventPayload {
    eventId: string;
    eventType: 'SURVEY_REMINDERS_DISPATCHED';
    projectId: string;
    campaignId: string;
    uncompletedCount: number;
    timestamp: string;
}
export declare class SurveyRemindersDispatchedEvent {
    readonly payload: SurveyRemindersDispatchedEventPayload;
    constructor(payload: Omit<SurveyRemindersDispatchedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
