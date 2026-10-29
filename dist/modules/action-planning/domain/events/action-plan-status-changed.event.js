"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPlanStatusChangedEvent = void 0;
class ActionPlanStatusChangedEvent {
    eventId;
    eventType = 'ACTION_PLAN_STATUS_CHANGED';
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
            eventType: 'ACTION_PLAN_STATUS_CHANGED',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.ActionPlanStatusChangedEvent = ActionPlanStatusChangedEvent;
//# sourceMappingURL=action-plan-status-changed.event.js.map