import mongoose, { Document } from 'mongoose';
export interface ISurveyTemplateDocument extends Document {
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
    pages: Array<{
        pageId: string;
        title?: Record<string, string>;
        pageOrder: number;
        sections: Array<{
            sectionId: string;
            title?: Record<string, string>;
            sectionOrder?: number;
            questions: Array<{
                questionId: string;
                type: string;
                groupId?: string;
                prompt: Record<string, string>;
                isMandatory?: boolean;
                options?: Array<{
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number;
                }>;
                logicRules?: Array<{
                    ruleId: string;
                    operator: string;
                    value: any;
                    targetPageId: string;
                }>;
            }>;
        }>;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SurveyTemplateModel: mongoose.Model<ISurveyTemplateDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISurveyTemplateDocument, {}, {}> & ISurveyTemplateDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
