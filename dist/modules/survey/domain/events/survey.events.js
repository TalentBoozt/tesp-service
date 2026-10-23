"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyClonedEvent = exports.SurveyPublishedEvent = exports.SurveyUpdatedEvent = exports.SurveyCreatedEvent = void 0;
class SurveyCreatedEvent {
    eventId;
    eventType = 'SURVEY_CREATED';
    aggregateId;
    timestamp;
    payload;
    constructor(surveyId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = surveyId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.SurveyCreatedEvent = SurveyCreatedEvent;
class SurveyUpdatedEvent {
    eventId;
    eventType = 'SURVEY_UPDATED';
    aggregateId;
    timestamp;
    payload;
    constructor(surveyId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = surveyId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.SurveyUpdatedEvent = SurveyUpdatedEvent;
class SurveyPublishedEvent {
    eventId;
    eventType = 'SURVEY_PUBLISHED';
    aggregateId;
    timestamp;
    payload;
    constructor(surveyId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = surveyId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.SurveyPublishedEvent = SurveyPublishedEvent;
class SurveyClonedEvent {
    eventId;
    eventType = 'SURVEY_CLONED';
    aggregateId;
    timestamp;
    payload;
    constructor(surveyId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = surveyId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.SurveyClonedEvent = SurveyClonedEvent;
//# sourceMappingURL=survey.events.js.map