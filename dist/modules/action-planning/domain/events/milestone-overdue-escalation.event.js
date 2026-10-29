"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneOverdueEscalationEvent = void 0;
class MilestoneOverdueEscalationEvent {
    eventId;
    eventType = 'MILESTONE_OVERDUE_ESCALATION';
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
            eventType: 'MILESTONE_OVERDUE_ESCALATION',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.MilestoneOverdueEscalationEvent = MilestoneOverdueEscalationEvent;
//# sourceMappingURL=milestone-overdue-escalation.event.js.map