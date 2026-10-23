"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectUpdatedEvent = exports.ProjectCreatedEvent = void 0;
class ProjectCreatedEvent {
    eventId;
    eventType = 'PROJECT_CREATED';
    aggregateId;
    timestamp;
    payload;
    constructor(projectId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = projectId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.ProjectCreatedEvent = ProjectCreatedEvent;
class ProjectUpdatedEvent {
    eventId;
    eventType = 'PROJECT_UPDATED';
    aggregateId;
    timestamp;
    payload;
    constructor(projectId, payload) {
        this.eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.aggregateId = projectId;
        this.timestamp = new Date();
        this.payload = payload;
    }
}
exports.ProjectUpdatedEvent = ProjectUpdatedEvent;
//# sourceMappingURL=project-events.js.map