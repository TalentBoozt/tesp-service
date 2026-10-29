import { DistributionChannel } from '../../domain/entities/campaign.entity';
import { TwilioSmsGateway } from '../../infrastructure/gateways/twilio-sms.gateway';
import { SlackWebhookGateway } from '../../infrastructure/gateways/slack-webhook.gateway';
import { TeamsWebhookGateway } from '../../infrastructure/gateways/teams-webhook.gateway';
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
    sentCount?: number;
    failedCount?: number;
    channelBreakdown: Record<string, number>;
    success: boolean;
    providerUsed?: string;
    detail?: string;
}
export declare class NotificationDispatcherAdapter {
    private twilioGateway;
    private slackGateway;
    private teamsGateway;
    constructor(twilioGateway?: TwilioSmsGateway, slackGateway?: SlackWebhookGateway, teamsGateway?: TeamsWebhookGateway);
    dispatchCampaignInvitations(req: DispatchNotificationRequest): Promise<DispatchResult>;
    dispatchReminders(projectId: string, campaignId: string, channels: DistributionChannel[], uncompletedRecipients: {
        email?: string;
        phone?: string;
        token: string;
        surveyUrl: string;
    }[]): Promise<DispatchResult>;
}
