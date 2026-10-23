import { ISurveyResponseRepository } from '../../../domain/repositories/survey-response.repository.interface';
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
}
