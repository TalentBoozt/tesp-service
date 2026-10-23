"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseSubmittedEvent = void 0;
class SurveyResponseSubmittedEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'SURVEY_RESPONSE_SUBMITTED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.SurveyResponseSubmittedEvent = SurveyResponseSubmittedEvent;
//# sourceMappingURL=survey-response-submitted.event.js.map