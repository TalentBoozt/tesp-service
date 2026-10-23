import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
export interface DispatchRemindersResult {
    campaignId: string;
    totalRemindersSent: number;
    uncompletedCount: number;
    dispatchedCount: number;
}
export declare class DispatchRemindersUseCase {
    private campaignRepo;
    private vaultRepo;
    private notificationDispatcher;
    constructor(campaignRepo: ISurveyCampaignRepository, vaultRepo: ITokenVaultRepository);
    execute(projectId: string, campaignId: string): Promise<DispatchRemindersResult>;
}
