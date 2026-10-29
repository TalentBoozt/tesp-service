import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { CampaignEntity } from '../../domain/entities/campaign.entity';
export declare class CompleteCampaignUseCase {
    private campaignRepo;
    constructor(campaignRepo: ISurveyCampaignRepository);
    execute(projectId: string, campaignId: string): Promise<CampaignEntity>;
}
