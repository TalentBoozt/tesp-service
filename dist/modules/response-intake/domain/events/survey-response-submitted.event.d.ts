import { AnonymityLevel } from '../../../survey-distribution/domain/entities/campaign.entity';
import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface SurveyResponseSubmittedEventPayload {
    eventId: string;
    eventType: 'SURVEY_RESPONSE_SUBMITTED';
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    responseId: string;
    respondentType: AnonymityLevel;
    nodeId?: string;
    answerCount: number;
    timestamp: string;
}
export declare class SurveyResponseSubmittedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "SURVEY_RESPONSE_SUBMITTED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: SurveyResponseSubmittedEventPayload;
    constructor(payload: Omit<SurveyResponseSubmittedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
