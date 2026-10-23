import { ISurveyResponseRepository } from '../../domain/repositories/survey-response.repository.interface';
import { SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
export declare class GetSurveyResponseUseCase {
    private responseRepo;
    constructor(responseRepo: ISurveyResponseRepository);
    execute(projectId: string, responseId: string): Promise<SurveyResponseEntity>;
}
