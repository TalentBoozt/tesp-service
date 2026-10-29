import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
export declare class DeleteCampaignUseCase {
    private campaignRepo;
    constructor(campaignRepo: ISurveyCampaignRepository);
    execute(projectId: string, campaignId: string): Promise<boolean>;
}
