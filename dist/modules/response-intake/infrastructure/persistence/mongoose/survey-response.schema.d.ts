import { Document } from 'mongoose';
import { AnonymityLevel } from '../../../../survey-distribution/domain/entities/campaign.entity';
export interface ISurveyResponseDocument extends Document {
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    responseId: string;
    respondentType: AnonymityLevel;
    responseToken?: string;
    nodeId?: string;
    demographicSnapshot?: Record<string, any>;
    answers: {
        questionId: string;
        questionType: string;
        numericValue?: number;
        textValue?: string;
        selectedOptions?: string[];
    }[];
    submittedAt: Date;
    isDeleted: boolean;
}
export declare const SurveyResponseModel: import("mongoose").Model<ISurveyResponseDocument, {}, {}, {}, Document<unknown, {}, ISurveyResponseDocument, {}, {}> & ISurveyResponseDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
