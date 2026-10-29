import { Schema, Document } from 'mongoose';
export interface IKnowledgeDocument extends Document {
    documentId: string;
    projectId: string;
    title: string;
    category: 'WELLBEING' | 'LEADERSHIP' | 'COMPLIANCE' | 'FLEXIBLE_WORK' | 'GENERAL';
    content: string;
    vectorId?: string;
    embedding?: number[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const KnowledgeDocumentSchema: Schema<IKnowledgeDocument, import("mongoose").Model<IKnowledgeDocument, any, any, any, Document<unknown, any, IKnowledgeDocument, any, {}> & IKnowledgeDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IKnowledgeDocument, Document<unknown, {}, import("mongoose").FlatRecord<IKnowledgeDocument>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<IKnowledgeDocument> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const KnowledgeDocumentModel: import("mongoose").Model<IKnowledgeDocument, {}, {}, {}, Document<unknown, {}, IKnowledgeDocument, {}, {}> & IKnowledgeDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
