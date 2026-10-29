"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkplaceRiskAlertEvent = void 0;
class WorkplaceRiskAlertEvent {
    eventId;
    eventType = 'WORKPLACE_RISK_ALERT';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.aggregateId = payload.responseId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'WORKPLACE_RISK_ALERT',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.WorkplaceRiskAlertEvent = WorkplaceRiskAlertEvent;
//# sourceMappingURL=workplace-risk-alert.event.js.map