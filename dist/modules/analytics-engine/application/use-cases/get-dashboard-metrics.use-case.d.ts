import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { ProtectedMetricResult } from '../../domain/services/privacy-guard.service';
import { RedisAnalyticsRepository } from '../../infrastructure/cache/redis-analytics.repository';
import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
export interface DimensionMetric {
    dimensionKey: string;
    dimensionName: string;
    score: number;
    previousScore?: number;
    benchmark?: number | null;
    variance?: number | null;
    favorablePercent?: number;
    neutralPercent?: number;
    unfavorablePercent?: number;
    responseCount: number;
}
export interface DashboardMetricsResult extends ProtectedMetricResult {
    campaignId: string;
    nodeId: string;
    totalTarget: number;
    totalResponses: number;
    responseRate: number;
    overallScore: number | null;
    enpsScore: number | null;
    benchmark?: number | null;
    variance?: number | null;
    promotersPercent: number;
    passivesPercent: number;
    detractorsPercent: number;
    dimensions: DimensionMetric[];
    groupScores: {
        groupId: string;
        score: number;
    }[];
    participationRate: number;
    hasData?: boolean;
    isBaseline?: boolean;
}
export declare const DIMENSION_LABEL_MAP: Record<string, string>;
export declare class GetDashboardMetricsUseCase {
    private responseRepo;
    private redisAnalyticsRepo?;
    private projectRepo?;
    private enpsCalculator;
    private engagementCalculator;
    private privacyGuard;
    constructor(responseRepo: ISurveyResponseRepository, redisAnalyticsRepo?: RedisAnalyticsRepository | undefined, projectRepo?: IProjectRepository | undefined);
    execute(projectId: string, campaignId: string, nodeId?: string, demographicFilters?: Record<string, any>, bypassPrivacy?: boolean): Promise<DashboardMetricsResult>;
}
