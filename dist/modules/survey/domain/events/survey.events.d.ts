import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export declare class SurveyCreatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "SURVEY_CREATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(surveyId: string, payload: Record<string, any>);
}
export declare class SurveyUpdatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "SURVEY_UPDATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(surveyId: string, payload: Record<string, any>);
}
export declare class SurveyPublishedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "SURVEY_PUBLISHED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(surveyId: string, payload: {
        projectId: string;
        surveyId: string;
        version: number;
        questionCount: number;
    });
}
export declare class SurveyClonedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "SURVEY_CLONED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: Record<string, any>;
    constructor(surveyId: string, payload: {
        projectId: string;
        surveyId: string;
        newVersion: number;
    });
}
