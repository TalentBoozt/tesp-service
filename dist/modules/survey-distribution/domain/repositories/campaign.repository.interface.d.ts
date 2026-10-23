import { CampaignEntity, CampaignStatus } from '../entities/campaign.entity';
export interface ISurveyCampaignRepository {
    save(campaign: CampaignEntity): Promise<CampaignEntity>;
    findByCampaignId(projectId: string, campaignId: string): Promise<CampaignEntity | null>;
    findAll(projectId: string, options?: {
        status?: CampaignStatus;
    }): Promise<CampaignEntity[]>;
    incrementMetrics(projectId: string, campaignId: string, field: 'sent' | 'delivered' | 'opened' | 'started' | 'completed' | 'bounced', count?: number): Promise<boolean>;
    softDelete(projectId: string, campaignId: string): Promise<boolean>;
}
