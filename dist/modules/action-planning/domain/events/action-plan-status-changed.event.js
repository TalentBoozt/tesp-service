"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPlanStatusChangedEvent = void 0;
class ActionPlanStatusChangedEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'ACTION_PLAN_STATUS_CHANGED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.ActionPlanStatusChangedEvent = ActionPlanStatusChangedEvent;
//# sourceMappingURL=action-plan-status-changed.event.js.map