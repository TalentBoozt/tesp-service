import { ISurveyResponseRepository } from '../../domain/repositories/survey-response.repository.interface';
import { SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
export declare class ListSurveyResponsesUseCase {
    private responseRepo;
    constructor(responseRepo: ISurveyResponseRepository);
    execute(projectId: string, campaignId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        responses: SurveyResponseEntity[];
        total: number;
    }>;
}
