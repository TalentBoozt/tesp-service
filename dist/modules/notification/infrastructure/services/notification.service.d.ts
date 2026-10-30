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
    createNotification(props: Omit<INotificationProps, 'notificationId'>, options?: {
        dispatchEmail?: boolean;
        emailSubject?: string;
    }): Promise<NotificationEntity>;
    notifyTenantProvisioned(projectId: string, tenantName: string, clientName?: string, tier?: string): Promise<NotificationEntity>;
    notifyOrgNodeCreated(projectId: string, nodeName: string, nodeType: string, parentNodeId?: string): Promise<NotificationEntity>;
    notifySurveyResponseSubmitted(projectId: string, surveyId: string, campaignId?: string, respondentCount?: number): Promise<NotificationEntity>;
    notifyCampaignLaunched(projectId: string, campaignId: string, campaignTitle: string, totalTargeted?: number): Promise<NotificationEntity>;
    notifySurveyPublished(projectId: string, surveyId: string, surveyTitle: string, version?: number): Promise<NotificationEntity>;
    notifyExecutiveWorkshopCreated(projectId: string, workshopTitle: string, consultantLead?: string): Promise<NotificationEntity>;
    notifySentimentAnomaly(projectId: string, nodeName: string, dropPercent: number, actionUrl?: string): Promise<NotificationEntity>;
    notifyCampaignMilestone(projectId: string, campaignTitle: string, quorumPercent: number, actionUrl?: string): Promise<NotificationEntity>;
    notifyReportReady(projectId: string, recipientUserId: string, reportTitle: string, downloadUrl?: string): Promise<NotificationEntity>;
    notifyHrisSync(projectId: string, recordsSynced: number, recordsUpdated: number): Promise<NotificationEntity>;
    notifyComplianceViolation(projectId: string, details: string): Promise<NotificationEntity>;
}
export declare const notificationService: NotificationService;
