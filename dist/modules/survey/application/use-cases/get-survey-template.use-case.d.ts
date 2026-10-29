import { SurveyTemplateMongoRepository } from '../../infrastructure/persistence/mongoose/survey-template.repository';
import { ISurveyTemplateDocument } from '../../infrastructure/persistence/mongoose/survey-template.schema';
export declare class GetSurveyTemplateUseCase {
    private templateRepo;
    constructor(templateRepo?: SurveyTemplateMongoRepository);
    execute(templateId: string): Promise<ISurveyTemplateDocument>;
}
