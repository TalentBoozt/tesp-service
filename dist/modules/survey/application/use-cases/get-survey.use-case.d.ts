import { ISurveyRepository } from '../../domain/repositories/survey.repository.interface';
import { SurveyEntity } from '../../domain/entities/survey.entity';
export declare class GetSurveyUseCase {
    private surveyRepo;
    constructor(surveyRepo: ISurveyRepository);
    execute(projectId: string, surveyId: string, version?: number): Promise<SurveyEntity>;
}
