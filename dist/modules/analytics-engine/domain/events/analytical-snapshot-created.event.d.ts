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
    timestamp: string;
}
export declare class AnalyticalSnapshotCreatedEvent {
    readonly payload: AnalyticalSnapshotCreatedEventPayload;
    constructor(payload: Omit<AnalyticalSnapshotCreatedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
