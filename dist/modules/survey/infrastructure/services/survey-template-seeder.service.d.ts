import { SurveyTemplateMongoRepository, ISurveyTemplate } from '../persistence/mongoose/survey-template.repository';
export declare class SurveyTemplateSeederService {
    private templateRepo;
    constructor(templateRepo?: SurveyTemplateMongoRepository);
    ensureDefaultTemplatesExist(): Promise<void>;
    getDefaultTemplates(): ISurveyTemplate[];
}
