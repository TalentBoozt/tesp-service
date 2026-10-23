import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiProviderAdapter } from '../adapters/ai-provider.adapter.interface';
import { SentimentLabel } from '../../domain/entities/ai-insight.entity';
export interface ThemeClusterResult {
    id: string;
    theme: string;
    sentiment: SentimentLabel;
    mentionCount: number;
    impactScore: number;
    sampleQuotes: string[];
}
export interface SentimentBreakdownResult {
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
}
export interface ExecutiveSummaryResult {
    campaignId: string;
    nodeId: string;
    overallSentiment: SentimentLabel;
    averageSentimentScore: number;
    overallSentimentScore: number;
    totalCommentsAnalyzed: number;
    executiveSummary: string;
    summaryText: string;
    sentimentBreakdown: SentimentBreakdownResult;
    keyThemes: ThemeClusterResult[];
    recommendedActions: string[];
    topStrengths: string[];
    topConcerns: string[];
    recommendations: string[];
}
export declare class GetExecutiveSummaryUseCase {
    private aiInsightRepo;
    private aiProvider;
    private responseRepo?;
    constructor(aiInsightRepo: IAiInsightRepository, aiProvider?: IAiProviderAdapter, responseRepo?: ISurveyResponseRepository | undefined);
    execute(projectId: string, campaignId: string, nodeId?: string): Promise<ExecutiveSummaryResult>;
}
