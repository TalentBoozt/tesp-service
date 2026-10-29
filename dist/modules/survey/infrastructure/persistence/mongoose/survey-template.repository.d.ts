import { ISurveyTemplateDocument } from './survey-template.schema';
export interface ISurveyTemplate {
    templateId: string;
    name: string | Record<string, string>;
    category: string;
    description: string | Record<string, string>;
    targetAudience?: string;
    estimatedTimeMinutes?: number;
    questionCount: number;
    sectionsCount: number;
    tags: string[];
    isPublic: boolean;
    projectId?: string;
    pages: any[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class SurveyTemplateMongoRepository {
    findAll(options?: {
        category?: string;
        projectId?: string;
    }): Promise<ISurveyTemplateDocument[]>;
    findByTemplateId(templateId: string): Promise<ISurveyTemplateDocument | null>;
    save(template: ISurveyTemplate): Promise<ISurveyTemplateDocument>;
}
