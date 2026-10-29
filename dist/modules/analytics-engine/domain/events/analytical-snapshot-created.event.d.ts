import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface AnalyticalSnapshotCreatedEventPayload {
    eventId: string;
    eventType: 'ANALYTICAL_SNAPSHOT_CREATED';
    projectId: string;
    campaignId: string;
    surveyId: string;
    snapshotId: string;
    totalResponses: number;
    overallEnps: number;
    overallEngagementIndex: number;
    departmentScores?: Array<{
        nodeId: string;
        score: number;
        departmentName?: string;
    }>;
    nodeAggregates?: Array<{
        nodeId: string;
        nodePath?: string;
        responseCount: number;
        status: 'VALID' | 'SUPPRESSED';
        enps: number | null;
        engagementIndex: number | null;
    }>;
    timestamp: string;
}
export declare class AnalyticalSnapshotCreatedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "ANALYTICAL_SNAPSHOT_CREATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: AnalyticalSnapshotCreatedEventPayload;
    constructor(payload: Omit<AnalyticalSnapshotCreatedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
