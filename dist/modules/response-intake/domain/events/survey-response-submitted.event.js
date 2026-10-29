"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseSubmittedEvent = void 0;
const crypto_1 = require("crypto");
class SurveyResponseSubmittedEvent {
    eventId;
    eventType = 'SURVEY_RESPONSE_SUBMITTED';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${(0, crypto_1.randomUUID)()}`;
        this.aggregateId = payload.responseId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'SURVEY_RESPONSE_SUBMITTED',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.SurveyResponseSubmittedEvent = SurveyResponseSubmittedEvent;
//# sourceMappingURL=survey-response-submitted.event.js.map