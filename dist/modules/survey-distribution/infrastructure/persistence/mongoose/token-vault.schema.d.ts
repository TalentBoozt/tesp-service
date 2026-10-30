import { Document } from 'mongoose';
export interface ITokenVaultDocument extends Document {
    projectId: string;
    campaignId: string;
    token: string;
    tokenHash?: string;
    channel?: string;
    employeeId?: string;
    nodeId?: string;
    matrixNodeIds?: string[];
    isBurned: boolean;
    burnedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
}
export declare const TokenVaultModel: import("mongoose").Model<ITokenVaultDocument, {}, {}, {}, Document<unknown, {}, ITokenVaultDocument, {}, {}> & ITokenVaultDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
