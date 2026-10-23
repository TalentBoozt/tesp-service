import { NotificationEntity, NotificationCategory, NotificationSeverity } from '../entities/notification.entity';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export interface FindNotificationsQuery {
    projectId: string;
    recipientUserId?: string;
    recipientRole?: UserRole;
    isRead?: boolean;
    category?: NotificationCategory;
    severity?: NotificationSeverity;
    limit?: number;
    offset?: number;
}
export interface INotificationRepository {
    save(notification: NotificationEntity): Promise<NotificationEntity>;
    saveBatch(notifications: NotificationEntity[]): Promise<void>;
    findByNotificationId(notificationId: string): Promise<NotificationEntity | null>;
    findTenantNotifications(query: FindNotificationsQuery): Promise<{
        notifications: NotificationEntity[];
        total: number;
    }>;
    countUnread(projectId: string, recipientUserId?: string, recipientRole?: UserRole): Promise<number>;
    markAsRead(notificationId: string, projectId: string): Promise<boolean>;
    markAllAsRead(projectId: string, recipientUserId?: string, recipientRole?: UserRole): Promise<number>;
    delete(notificationId: string, projectId: string): Promise<boolean>;
}
