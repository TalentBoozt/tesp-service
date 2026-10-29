import { SurveyTemplateMongoRepository } from '../../infrastructure/persistence/mongoose/survey-template.repository';
import { ISurveyTemplateDocument } from '../../infrastructure/persistence/mongoose/survey-template.schema';
export declare class ListSurveyTemplatesUseCase {
    private templateRepo;
    constructor(templateRepo?: SurveyTemplateMongoRepository);
    execute(options?: {
        category?: string;
        projectId?: string;
    }): Promise<ISurveyTemplateDocument[]>;
}
