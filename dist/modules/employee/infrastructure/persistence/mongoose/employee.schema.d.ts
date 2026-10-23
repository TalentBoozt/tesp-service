import mongoose, { Document } from 'mongoose';
export interface IEmployeeDocument extends Document {
    projectId: string;
    employeeId: string;
    nodeId: string;
    matrixNodeIds: string[];
    email?: string;
    fullName: string;
    phoneNumber?: string;
    status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
    attributes: Record<string, any>;
    version: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EmployeeModel: mongoose.Model<IEmployeeDocument, {}, {}, {}, mongoose.Document<unknown, {}, IEmployeeDocument, {}, {}> & IEmployeeDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
