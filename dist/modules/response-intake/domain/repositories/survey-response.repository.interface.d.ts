import { SurveyResponseEntity } from '../entities/survey-response.entity';
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
}
