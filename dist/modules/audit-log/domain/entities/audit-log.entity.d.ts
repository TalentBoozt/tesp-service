export interface AuditLogProps {
    id?: string;
    eventId?: string;
    projectId: string;
    actorId: string;
    actorRole: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    timestamp?: Date;
}
export declare class AuditLogEntity {
    readonly id?: string;
    readonly eventId: string;
    readonly projectId: string;
    readonly actorId: string;
    readonly actorRole: string;
    readonly action: string;
    readonly resourceType: string;
    readonly resourceId: string;
    readonly metadata: Record<string, any>;
    readonly ipAddress: string;
    readonly timestamp: Date;
    constructor(props: AuditLogProps);
    toJSON(): Record<string, any>;
}
