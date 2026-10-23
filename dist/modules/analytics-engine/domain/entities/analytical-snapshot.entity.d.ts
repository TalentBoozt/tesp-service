export interface GroupScore {
    groupId: string;
    score: number;
}
export interface NodeAggregate {
    nodeId: string;
    nodePath?: string;
    responseCount: number;
    status: 'VALID' | 'SUPPRESSED';
    enps: number | null;
    engagementIndex: number | null;
}
export interface AnalyticalSnapshotProps {
    projectId: string;
    campaignId: string;
    surveyId: string;
    snapshotId: string;
    snapshotDate?: Date;
    totalResponses: number;
    overallEnps: number;
    overallEngagementIndex: number;
    participationRate?: number;
    groupScores?: GroupScore[];
    nodeAggregates?: NodeAggregate[];
    createdAt?: Date;
}
export declare class AnalyticalSnapshotEntity {
    readonly projectId: string;
    readonly campaignId: string;
    readonly surveyId: string;
    readonly snapshotId: string;
    readonly snapshotDate: Date;
    readonly totalResponses: number;
    readonly overallEnps: number;
    readonly overallEngagementIndex: number;
    readonly participationRate: number;
    readonly groupScores: GroupScore[];
    readonly nodeAggregates: NodeAggregate[];
    readonly createdAt: Date;
    constructor(props: AnalyticalSnapshotProps);
    private validateSnapshotId;
    toJSON(): AnalyticalSnapshotProps;
}
