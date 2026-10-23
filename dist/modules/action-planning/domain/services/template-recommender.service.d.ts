import { ActionTemplateEntity } from '../entities/action-template.entity';
export declare class TemplateRecommenderService {
    private defaultCatalog;
    recommendTemplates(groupId?: string, score?: number): ActionTemplateEntity[];
}
