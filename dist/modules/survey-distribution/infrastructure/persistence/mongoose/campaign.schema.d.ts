import { Document } from 'mongoose';
import { AnonymityLevel, DistributionChannel, CampaignStatus } from '../../../domain/entities/campaign.entity';
export interface ICampaignDocument extends Document {
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    title: string;
    anonymityLevel: AnonymityLevel;
    channels: DistributionChannel[];
    targetAudience?: {
        nodeIds?: string[];
        demographicFilters?: Record<string, any>;
    };
    schedule?: {
        reminderDates?: Date[];
        reminderFrequencyDays?: number;
    };
    metrics: {
        totalTargeted: number;
        sent: number;
        delivered: number;
        opened: number;
        started: number;
        completed: number;
        bounced: number;
    };
    status: CampaignStatus;
    startDate: Date;
    expirationDate: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CampaignModel: import("mongoose").Model<ICampaignDocument, {}, {}, {}, Document<unknown, {}, ICampaignDocument, {}, {}> & ICampaignDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
