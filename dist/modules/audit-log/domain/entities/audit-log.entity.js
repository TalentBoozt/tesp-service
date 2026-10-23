"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogEntity = void 0;
const crypto_1 = __importDefault(require("crypto"));
class AuditLogEntity {
    id;
    eventId;
    projectId;
    actorId;
    actorRole;
    action;
    resourceType;
    resourceId;
    metadata;
    ipAddress;
    timestamp;
    constructor(props) {
        this.id = props.id;
        this.eventId = props.eventId || crypto_1.default.randomUUID();
        this.projectId = props.projectId;
        this.actorId = props.actorId || 'SYSTEM';
        this.actorRole = props.actorRole || 'SYSTEM_DAEMON';
        this.action = props.action;
        this.resourceType = props.resourceType;
        this.resourceId = props.resourceId;
        this.metadata = props.metadata || {};
        this.ipAddress = props.ipAddress || '127.0.0.1';
        this.timestamp = props.timestamp ? new Date(props.timestamp) : new Date();
    }
    toJSON() {
        return {
            id: this.id || this.eventId,
            eventId: this.eventId,
            projectId: this.projectId,
            actorId: this.actorId,
            actorRole: this.actorRole,
            action: this.action,
            resourceType: this.resourceType,
            resourceId: this.resourceId,
            metadata: this.metadata,
            ipAddress: this.ipAddress,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.AuditLogEntity = AuditLogEntity;
//# sourceMappingURL=audit-log.entity.js.map