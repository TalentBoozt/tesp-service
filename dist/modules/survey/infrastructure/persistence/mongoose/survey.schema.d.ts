import mongoose, { Document } from 'mongoose';
export interface ISurveyDocument extends Document {
    projectId: string;
    surveyId: string;
    version: number;
    title: Record<string, string>;
    description?: Record<string, string>;
    status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
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
    publishedAt?: Date | null;
    versionHistory: Array<{
        version: number;
        publishedAt: Date;
        publishedBy?: string;
    }>;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SurveyModel: mongoose.Model<ISurveyDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISurveyDocument, {}, {}> & ISurveyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IQuestionLibraryDocument extends Document {
    projectId: string;
    libraryItemId: string;
    category: string;
    groupId: string;
    type: string;
    prompt: Record<string, string>;
    options?: Array<{
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number;
    }>;
    isDeleted: boolean;
    createdAt: Date;
}
export declare const QuestionLibraryModel: mongoose.Model<IQuestionLibraryDocument, {}, {}, {}, mongoose.Document<unknown, {}, IQuestionLibraryDocument, {}, {}> & IQuestionLibraryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
