"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratedEvent = void 0;
class ReportGeneratedEvent {
    eventId;
    eventType = 'REPORT_GENERATED';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.aggregateId = payload.jobId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'REPORT_GENERATED',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.ReportGeneratedEvent = ReportGeneratedEvent;
//# sourceMappingURL=report-generated.event.js.map