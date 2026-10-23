"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgNodeArchivedEvent = exports.OrgNodeMovedEvent = exports.OrgNodeCreatedEvent = void 0;
class OrgNodeCreatedEvent {
    eventId;
    eventType = 'ORG_NODE_CREATED';
    aggregateId;
    timestamp;
    payload;
    constructor(nodeId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = nodeId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.OrgNodeCreatedEvent = OrgNodeCreatedEvent;
class OrgNodeMovedEvent {
    eventId;
    eventType = 'ORG_NODE_MOVED';
    aggregateId;
    timestamp;
    payload;
    constructor(nodeId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = nodeId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.OrgNodeMovedEvent = OrgNodeMovedEvent;
class OrgNodeArchivedEvent {
    eventId;
    eventType = 'ORG_NODE_ARCHIVED';
    aggregateId;
    timestamp;
    payload;
    constructor(nodeId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = nodeId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.OrgNodeArchivedEvent = OrgNodeArchivedEvent;
//# sourceMappingURL=org-node.events.js.map