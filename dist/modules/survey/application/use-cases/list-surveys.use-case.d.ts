import { ISurveyRepository } from '../../domain/repositories/survey.repository.interface';
import { SurveyEntity } from '../../domain/entities/survey.entity';
export declare class ListSurveysUseCase {
    private surveyRepo;
    constructor(surveyRepo: ISurveyRepository);
    execute(projectId: string, options?: {
        status?: string;
    }): Promise<SurveyEntity[]>;
}
