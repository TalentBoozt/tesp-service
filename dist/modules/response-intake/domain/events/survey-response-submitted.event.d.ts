import { AnonymityLevel } from '../../../survey-distribution/domain/entities/campaign.entity';
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
export declare class SurveyResponseSubmittedEvent {
    readonly payload: SurveyResponseSubmittedEventPayload;
    constructor(payload: Omit<SurveyResponseSubmittedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
