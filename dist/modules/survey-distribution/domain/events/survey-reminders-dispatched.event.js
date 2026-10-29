"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyRemindersDispatchedEvent = void 0;
class SurveyRemindersDispatchedEvent {
    eventId;
    eventType = 'SURVEY_REMINDERS_DISPATCHED';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.aggregateId = payload.campaignId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'SURVEY_REMINDERS_DISPATCHED',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.SurveyRemindersDispatchedEvent = SurveyRemindersDispatchedEvent;
//# sourceMappingURL=survey-reminders-dispatched.event.js.map