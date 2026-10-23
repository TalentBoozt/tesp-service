import { IActionTemplateRepository } from '../../domain/repositories/action-template.repository.interface';
import { ActionTemplateEntity } from '../../domain/entities/action-template.entity';
export declare class GetRecommendedTemplatesUseCase {
    private templateRepo?;
    private recommender;
    constructor(templateRepo?: IActionTemplateRepository | undefined);
    execute(groupId?: string, score?: number, surveyId?: string, projectId?: string): Promise<ActionTemplateEntity[]>;
}
