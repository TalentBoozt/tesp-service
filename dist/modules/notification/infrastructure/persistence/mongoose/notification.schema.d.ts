import mongoose, { Document } from 'mongoose';
import { NotificationCategory, NotificationSeverity } from '../../../domain/entities/notification.entity';
import { UserRole } from '../../../../../shared/presentation/middleware/auth.middleware';
export interface INotificationDocument extends Document {
    notificationId: string;
    projectId: string;
    recipientUserId?: string;
    recipientRole?: UserRole;
    category: NotificationCategory;
    severity: NotificationSeverity;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
    isRead: boolean;
    readAt?: Date | null;
    emailDispatched: boolean;
    emailDispatchedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationModel: mongoose.Model<INotificationDocument, {}, {}, {}, mongoose.Document<unknown, {}, INotificationDocument, {}, {}> & INotificationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
