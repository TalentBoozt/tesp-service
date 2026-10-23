import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
export interface DeliveryWebhookPayload {
    provider: 'AWS_SES' | 'TWILIO';
    eventType: 'DELIVERED' | 'OPENED' | 'BOUNCED' | 'FAILED';
    projectId: string;
    campaignId: string;
    recipientEmail?: string;
    recipientPhone?: string;
    timestamp?: string;
}
export declare class HandleDeliveryWebhookUseCase {
    private campaignRepo;
    constructor(campaignRepo: ISurveyCampaignRepository);
    execute(payload: DeliveryWebhookPayload): Promise<boolean>;
}
