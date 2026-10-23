"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = exports.AuditLogModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const audit_log_schema_1 = require("../../../modules/audit-log/infrastructure/persistence/mongoose/audit-log.schema");
Object.defineProperty(exports, "AuditLogModel", { enumerable: true, get: function () { return audit_log_schema_1.AuditLogModel; } });
class AuditLogger {
    static inMemoryLogs = [];
    static async log(params) {
        const auditId = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const logData = {
            eventId: auditId,
            auditId,
            projectId: params.projectId,
            action: params.action,
            actorId: params.actorId,
            actorRole: params.actorRole,
            resource: params.resource,
            resourceType: params.resource.includes(':') ? params.resource.split(':')[0] : 'SYSTEM',
            resourceId: params.resource.includes(':') ? params.resource.split(':').slice(1).join(':') : params.resource,
            details: params.details || {},
            metadata: params.details || {},
            ipAddress: '127.0.0.1',
            timestamp: new Date(),
        };
        this.inMemoryLogs.push(logData);
        if (mongoose_1.default.connection.readyState !== 1) {
            return null;
        }
        try {
            const entry = new audit_log_schema_1.AuditLogModel(logData);
            return await entry.save();
        }
        catch (err) {
            console.error('[AuditLogger] Error saving log entry:', err);
            return null;
        }
    }
}
exports.AuditLogger = AuditLogger;
//# sourceMappingURL=audit-logger.js.map