import { AuditLogModel, AuditLogDocument } from '../../../modules/audit-log/infrastructure/persistence/mongoose/audit-log.schema';
export type IAuditLog = AuditLogDocument;
export { AuditLogModel };
export declare class AuditLogger {
    static inMemoryLogs: Array<{
        auditId: string;
        projectId: string;
        action: string;
        actorId: string;
        actorRole: string;
        resource: string;
        details?: Record<string, any>;
        timestamp: Date;
    }>;
    static log(params: {
        projectId: string;
        action: string;
        actorId: string;
        actorRole: string;
        resource: string;
        details?: Record<string, any>;
    }): Promise<AuditLogDocument | null>;
}
