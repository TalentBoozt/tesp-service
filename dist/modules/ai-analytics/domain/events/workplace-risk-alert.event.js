"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkplaceRiskAlertEvent = void 0;
class WorkplaceRiskAlertEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'WORKPLACE_RISK_ALERT',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.WorkplaceRiskAlertEvent = WorkplaceRiskAlertEvent;
//# sourceMappingURL=workplace-risk-alert.event.js.map