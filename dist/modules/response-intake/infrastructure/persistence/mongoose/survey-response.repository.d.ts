import { ISurveyResponseRepository, DashboardAggregationResult, HeatmapAggregationResult } from '../../../domain/repositories/survey-response.repository.interface';
import { SurveyResponseEntity } from '../../../domain/entities/survey-response.entity';
export declare class SurveyResponseMongoRepository implements ISurveyResponseRepository {
    private toEntity;
    save(response: SurveyResponseEntity): Promise<SurveyResponseEntity>;
    findByResponseId(projectId: string, responseId: string): Promise<SurveyResponseEntity | null>;
    findAllByCampaign(projectId: string, campaignId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        responses: SurveyResponseEntity[];
        total: number;
    }>;
    aggregateDashboardStats(projectId: string, campaignId: string, filter?: {
        nodeId?: string;
        demographicFilters?: Record<string, string>;
    }): Promise<DashboardAggregationResult>;
    aggregateHeatmapByDepartment(projectId: string, campaignId: string): Promise<HeatmapAggregationResult[]>;
    findSubmissionTimestamps(projectId: string, nodeId?: string): Promise<Date[]>;
}
