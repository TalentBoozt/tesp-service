import { Document } from 'mongoose';
export interface IAnalyticalSnapshotDocument extends Document {
    projectId: string;
    campaignId: string;
    surveyId: string;
    snapshotId: string;
    snapshotDate: Date;
    totalResponses: number;
    overallEnps: number;
    overallEngagementIndex: number;
    participationRate: number;
    groupScores: {
        groupId: string;
        score: number;
    }[];
    nodeAggregates: {
        nodeId: string;
        nodePath?: string;
        responseCount: number;
        status: 'VALID' | 'SUPPRESSED';
        enps: number | null;
        engagementIndex: number | null;
    }[];
    createdAt: Date;
}
export declare const AnalyticalSnapshotModel: import("mongoose").Model<IAnalyticalSnapshotDocument, {}, {}, {}, Document<unknown, {}, IAnalyticalSnapshotDocument, {}, {}> & IAnalyticalSnapshotDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
