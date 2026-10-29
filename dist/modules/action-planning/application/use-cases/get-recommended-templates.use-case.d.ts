import { IActionTemplateRepository } from '../../domain/repositories/action-template.repository.interface';
import { ActionTemplateEntity } from '../../domain/entities/action-template.entity';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
export declare class GetRecommendedTemplatesUseCase {
    private templateRepo?;
    private responseRepo?;
    private recommender;
    constructor(templateRepo?: IActionTemplateRepository | undefined, responseRepo?: ISurveyResponseRepository | undefined);
    execute(groupId?: string, score?: number, surveyId?: string, projectId?: string): Promise<ActionTemplateEntity[]>;
}
