import { Document } from 'mongoose';
export interface IHrisConfigDocument extends Document {
    projectId: string;
    provider: 'WORKDAY' | 'BAMBOOHR' | 'SAP_SUCCESSFACTORS' | 'OTHER';
    tenantUrl: string;
    clientId: string;
    clientSecret: string;
    syncSchedule: 'HOURLY' | 'NIGHTLY' | 'WEEKLY' | 'MANUAL';
    lastSyncAt?: Date;
    syncedCount?: number;
    status: 'CONNECTED' | 'PAUSED' | 'ERROR';
    createdAt: Date;
    updatedAt: Date;
}
export declare const HrisConfigModel: import("mongoose").Model<IHrisConfigDocument, {}, {}, {}, Document<unknown, {}, IHrisConfigDocument, {}, {}> & IHrisConfigDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
