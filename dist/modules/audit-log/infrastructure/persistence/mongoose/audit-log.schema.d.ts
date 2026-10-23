import mongoose, { Document } from 'mongoose';
export interface AuditLogDocument extends Document {
    eventId: string;
    auditId?: string;
    projectId: string;
    actorId: string;
    actorRole: string;
    action: string;
    resourceType: string;
    resourceId: string;
    resource?: string;
    metadata: Record<string, any>;
    details?: Record<string, any>;
    ipAddress: string;
    timestamp: Date;
}
export declare const AuditLogModel: mongoose.Model<any, {}, {}, {}, any, any>;
