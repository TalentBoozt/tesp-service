import mongoose, { Document } from 'mongoose';
export interface IUserDocument extends Document {
    userId: string;
    email?: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    firmId?: string;
    authorizedProjectIds: string[];
    primaryProjectId: string;
    employeeId?: string;
    phoneNumber?: string;
    mustChangePassword: boolean;
    failedLoginAttempts: number;
    lockoutUntil?: Date;
    passwordChangedAt?: Date;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserModel: mongoose.Model<any, {}, {}, {}, any, any>;
