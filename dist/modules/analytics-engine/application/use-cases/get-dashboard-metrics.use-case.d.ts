import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { ProtectedMetricResult } from '../../domain/services/privacy-guard.service';
import { RedisAnalyticsRepository } from '../../infrastructure/cache/redis-analytics.repository';
export interface DimensionMetric {
    dimensionKey: string;
    dimensionName: string;
    score: number;
    previousScore?: number;
    responseCount: number;
}
export interface DashboardMetricsResult extends ProtectedMetricResult {
    campaignId: string;
    nodeId: string;
    totalTarget: number;
    totalResponses: number;
    responseRate: number;
    overallScore: number;
    enpsScore: number;
    promotersPercent: number;
    passivesPercent: number;
    detractorsPercent: number;
    dimensions: DimensionMetric[];
    groupScores: {
        groupId: string;
        score: number;
    }[];
    participationRate: number;
}
export declare class GetDashboardMetricsUseCase {
    private responseRepo;
    private redisAnalyticsRepo?;
    private enpsCalculator;
    private engagementCalculator;
    private privacyGuard;
    constructor(responseRepo: ISurveyResponseRepository, redisAnalyticsRepo?: RedisAnalyticsRepository | undefined);
    execute(projectId: string, campaignId: string, nodeId?: string, demographicFilters?: Record<string, any>): Promise<DashboardMetricsResult>;
}
