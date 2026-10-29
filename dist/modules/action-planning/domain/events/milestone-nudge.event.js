"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneNudgeEvent = void 0;
class MilestoneNudgeEvent {
    eventId;
    eventType = 'MILESTONE_NUDGE';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.aggregateId = payload.actionPlanId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'MILESTONE_NUDGE',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.MilestoneNudgeEvent = MilestoneNudgeEvent;
//# sourceMappingURL=milestone-nudge.event.js.map