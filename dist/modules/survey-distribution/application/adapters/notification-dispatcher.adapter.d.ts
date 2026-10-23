import { DistributionChannel } from '../../domain/entities/campaign.entity';
export interface DispatchNotificationRequest {
    projectId: string;
    campaignId: string;
    channels: DistributionChannel[];
    recipients: {
        employeeId?: string;
        email?: string;
        phone?: string;
        nodeId?: string;
        token: string;
        surveyUrl: string;
    }[];
    title: string;
    surveyId: string;
}
export interface DispatchResult {
    totalDispatched: number;
    channelBreakdown: Record<string, number>;
    success: boolean;
    providerUsed?: string;
    detail?: string;
}
export declare class NotificationDispatcherAdapter {
    dispatchCampaignInvitations(req: DispatchNotificationRequest): Promise<DispatchResult>;
    dispatchReminders(projectId: string, campaignId: string, channels: DistributionChannel[], uncompletedRecipients: {
        email?: string;
        phone?: string;
        token: string;
        surveyUrl: string;
    }[]): Promise<DispatchResult>;
}
