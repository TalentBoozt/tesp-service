"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratedEvent = void 0;
class ReportGeneratedEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'REPORT_GENERATED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.ReportGeneratedEvent = ReportGeneratedEvent;
//# sourceMappingURL=report-generated.event.js.map