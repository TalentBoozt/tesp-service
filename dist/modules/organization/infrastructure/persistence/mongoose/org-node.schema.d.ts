import mongoose, { Document } from 'mongoose';
export interface IOrgNodeDocument extends Document {
    projectId: string;
    nodeId: string;
    name: string;
    type: string;
    parentId?: string | null;
    path: string;
    depth: number;
    displayOrder: number;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    attributes: Record<string, any>;
    version: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const OrgNodeModel: mongoose.Model<IOrgNodeDocument, {}, {}, {}, mongoose.Document<unknown, {}, IOrgNodeDocument, {}, {}> & IOrgNodeDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
