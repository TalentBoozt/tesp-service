import { INotificationRepository, FindNotificationsQuery } from '../../../domain/repositories/notification.repository.interface';
import { NotificationEntity } from '../../../domain/entities/notification.entity';
import { UserRole } from '../../../../../shared/presentation/middleware/auth.middleware';
export declare class MongoNotificationRepository implements INotificationRepository {
    private toEntity;
    save(notification: NotificationEntity): Promise<NotificationEntity>;
    saveBatch(notifications: NotificationEntity[]): Promise<void>;
    findByNotificationId(notificationId: string): Promise<NotificationEntity | null>;
    private buildRecipientFilter;
    private isGlobalScope;
    findTenantNotifications(query: FindNotificationsQuery): Promise<{
        notifications: NotificationEntity[];
        total: number;
    }>;
    countUnread(projectId: string, recipientUserId?: string, recipientRole?: UserRole): Promise<number>;
    markAsRead(notificationId: string, projectId: string): Promise<boolean>;
    markAllAsRead(projectId: string, recipientUserId?: string, recipientRole?: UserRole): Promise<number>;
    delete(notificationId: string, projectId: string): Promise<boolean>;
}
