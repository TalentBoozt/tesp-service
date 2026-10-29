"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticalSnapshotCreatedEvent = void 0;
class AnalyticalSnapshotCreatedEvent {
    eventId;
    eventType = 'ANALYTICAL_SNAPSHOT_CREATED';
    aggregateId;
    timestamp;
    payload;
    constructor(payload) {
        this.eventId = `EVT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        this.aggregateId = payload.snapshotId;
        this.timestamp = new Date();
        this.payload = {
            ...payload,
            eventId: this.eventId,
            eventType: 'ANALYTICAL_SNAPSHOT_CREATED',
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.AnalyticalSnapshotCreatedEvent = AnalyticalSnapshotCreatedEvent;
//# sourceMappingURL=analytical-snapshot-created.event.js.map