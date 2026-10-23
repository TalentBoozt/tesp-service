import mongoose, { Document } from 'mongoose';
export interface IConsultingFirmDocument extends Document {
    firmId: string;
    name: string;
    slug: string;
    contactEmail: string;
    tier: 'ENTERPRISE' | 'BOUTIQUE' | 'INTERNAL';
    assignedProjectIds: string[];
    consultantUserIds: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ConsultingFirmModel: mongoose.Model<any, {}, {}, {}, any, any>;
