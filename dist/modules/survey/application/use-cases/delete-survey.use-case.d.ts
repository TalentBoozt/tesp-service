import { ISurveyRepository } from '../../domain/repositories/survey.repository.interface';
export declare class DeleteSurveyUseCase {
    private surveyRepo;
    constructor(surveyRepo: ISurveyRepository);
    execute(projectId: string, surveyId: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<boolean>;
}
