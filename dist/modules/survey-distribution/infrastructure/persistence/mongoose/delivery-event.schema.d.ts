import { Document } from 'mongoose';
export interface IDeliveryEventDocument extends Document {
    provider: 'AWS_SES' | 'TWILIO';
    eventId: string;
    projectId: string;
    campaignId: string;
    eventType: string;
    recipient?: string;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DeliveryEventModel: import("mongoose").Model<IDeliveryEventDocument, {}, {}, {}, Document<unknown, {}, IDeliveryEventDocument, {}, {}> & IDeliveryEventDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
