import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
export interface DeliveryWebhookPayload {
    provider: 'AWS_SES' | 'TWILIO';
    eventType: 'DELIVERED' | 'OPENED' | 'BOUNCED' | 'FAILED';
    projectId: string;
    campaignId: string;
    eventId?: string;
    messageId?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    timestamp?: string;
}
export interface DeliveryWebhookResult {
    updated: boolean;
    status: 'PROCESSED' | 'ALREADY_PROCESSED' | 'IGNORED';
    eventId?: string;
}
export interface IDeliveryEventStore {
    recordEvent(provider: string, eventId: string, metadata?: any): Promise<boolean>;
    clear?(): void;
}
export declare class InMemoryDeliveryEventStore implements IDeliveryEventStore {
    private seen;
    recordEvent(provider: string, eventId: string): Promise<boolean>;
    clear(): void;
}
export declare class HandleDeliveryWebhookUseCase {
    private campaignRepo;
    private eventStore?;
    private inMemoryFallback;
    constructor(campaignRepo: ISurveyCampaignRepository, eventStore?: IDeliveryEventStore | undefined);
    execute(payload: DeliveryWebhookPayload): Promise<DeliveryWebhookResult>;
    private recordEventId;
}
