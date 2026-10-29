import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { NotificationEntity, INotificationProps } from '../../domain/entities/notification.entity';
export declare class NotificationService {
    private repo;
    constructor(repo?: INotificationRepository);
    private generateId;
    resolveAlertRecipients(projectId: string): Promise<Array<{
        email: string;
        name: string;
    }>>;
    createNotification(props: Omit<INotificationProps, 'notificationId'>): Promise<NotificationEntity>;
    notifySentimentAnomaly(projectId: string, nodeName: string, dropPercent: number, actionUrl?: string): Promise<NotificationEntity>;
    notifyCampaignMilestone(projectId: string, campaignTitle: string, quorumPercent: number, actionUrl?: string): Promise<NotificationEntity>;
    notifyReportReady(projectId: string, recipientUserId: string, reportTitle: string, downloadUrl?: string): Promise<NotificationEntity>;
    notifyHrisSync(projectId: string, recordsSynced: number, recordsUpdated: number): Promise<NotificationEntity>;
    notifyComplianceViolation(projectId: string, details: string): Promise<NotificationEntity>;
}
export declare const notificationService: NotificationService;
