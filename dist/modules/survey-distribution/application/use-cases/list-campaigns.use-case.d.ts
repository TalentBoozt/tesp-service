import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { CampaignEntity, CampaignStatus } from '../../domain/entities/campaign.entity';
export declare class ListCampaignsUseCase {
    private campaignRepo;
    constructor(campaignRepo: ISurveyCampaignRepository);
    execute(projectId: string, status?: CampaignStatus): Promise<CampaignEntity[]>;
}
