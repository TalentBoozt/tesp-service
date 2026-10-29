import { SurveyTemplateMongoRepository } from '../../infrastructure/persistence/mongoose/survey-template.repository';
import { CreateSurveyDraftUseCase } from './create-survey-draft.use-case';
import { SurveyEntity } from '../../domain/entities/survey.entity';
export interface InstantiateTemplateInput {
    projectId: string;
    templateId: string;
    surveyId: string;
    title: string | Record<string, string>;
    description?: string | Record<string, string>;
    anonymous?: boolean;
}
export declare class InstantiateSurveyTemplateUseCase {
    private templateRepo;
    private createDraftUseCase;
    constructor(templateRepo: SurveyTemplateMongoRepository | undefined, createDraftUseCase: CreateSurveyDraftUseCase);
    execute(input: InstantiateTemplateInput, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<SurveyEntity>;
}
