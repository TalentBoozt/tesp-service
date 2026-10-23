import { Document } from 'mongoose';
export interface IActionTemplateDocument extends Document {
    templateId: string;
    groupId: string;
    title: string;
    description: string;
    suggestedMilestones: string[];
}
export declare const ActionTemplateModel: import("mongoose").Model<IActionTemplateDocument, {}, {}, {}, Document<unknown, {}, IActionTemplateDocument, {}, {}> & IActionTemplateDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
