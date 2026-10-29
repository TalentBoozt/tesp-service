import { SurveyResponseEntity } from '../entities/survey-response.entity';
export interface DashboardAggregationResult {
    totalResponses: number;
    npsStats: {
        promoters: number;
        passives: number;
        detractors: number;
        totalNps: number;
        avgNpsScore: number;
    };
    dimensionStats: {
        groupId: string;
        avgScore: number;
        count: number;
    }[];
}
export interface HeatmapAggregationResult {
    nodeId: string;
    groupId: string;
    avgScore: number;
    count: number;
}
export interface ISurveyResponseRepository {
    save(response: SurveyResponseEntity): Promise<SurveyResponseEntity>;
    findByResponseId(projectId: string, responseId: string): Promise<SurveyResponseEntity | null>;
    findAllByCampaign(projectId: string, campaignId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        responses: SurveyResponseEntity[];
        total: number;
    }>;
    aggregateDashboardStats?(projectId: string, campaignId: string, filter?: {
        nodeId?: string;
        demographicFilters?: Record<string, string>;
    }): Promise<DashboardAggregationResult>;
    aggregateHeatmapByDepartment?(projectId: string, campaignId: string): Promise<HeatmapAggregationResult[]>;
    findSubmissionTimestamps?(projectId: string, nodeId?: string): Promise<Date[]>;
}
