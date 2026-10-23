"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyRemindersDispatchedEvent = void 0;
class SurveyRemindersDispatchedEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'SURVEY_REMINDERS_DISPATCHED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.SurveyRemindersDispatchedEvent = SurveyRemindersDispatchedEvent;
//# sourceMappingURL=survey-reminders-dispatched.event.js.map