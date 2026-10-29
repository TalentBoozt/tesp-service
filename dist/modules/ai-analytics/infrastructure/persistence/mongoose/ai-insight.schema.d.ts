import { Document } from 'mongoose';
import { SentimentLabel, RiskCategory, RiskSeverity } from '../../../domain/entities/ai-insight.entity';
export interface IAiInsightDocument extends Document {
    projectId: string;
    campaignId: string;
    responseId: string;
    questionId: string;
    insightId: string;
    nodeId?: string;
    sanitizedText: string;
    sentimentScore: number;
    sentimentLabel: SentimentLabel;
    confidence: number;
    themes: string[];
    riskFlags: {
        category: RiskCategory;
        severity: RiskSeverity;
        keyword: string;
    }[];
    humanOverride?: {
        overriddenBy: string;
        originalLabel: SentimentLabel;
        newLabel: SentimentLabel;
        reason?: string;
        overriddenAt: Date;
    };
    processedAt: Date;
    isAiSimulated?: boolean;
    fallbackReason?: string;
}
export declare const AiInsightModel: import("mongoose").Model<IAiInsightDocument, {}, {}, {}, Document<unknown, {}, IAiInsightDocument, {}, {}> & IAiInsightDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
