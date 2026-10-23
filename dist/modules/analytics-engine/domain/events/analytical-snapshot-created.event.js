"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticalSnapshotCreatedEvent = void 0;
class AnalyticalSnapshotCreatedEvent {
    payload;
    constructor(payload) {
        this.payload = {
            ...payload,
            eventId: `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            eventType: 'ANALYTICAL_SNAPSHOT_CREATED',
            timestamp: new Date().toISOString(),
        };
    }
}
exports.AnalyticalSnapshotCreatedEvent = AnalyticalSnapshotCreatedEvent;
//# sourceMappingURL=analytical-snapshot-created.event.js.map