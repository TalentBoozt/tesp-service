import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { CampaignMetrics, CampaignStatus } from '../../domain/entities/campaign.entity';
export interface CampaignMetricsResult {
    projectId: string;
    campaignId: string;
    title: string;
    status: CampaignStatus;
    metrics: CampaignMetrics;
    participationRatePercent: number;
    deliverySuccessPercent: number;
    sentCount: number;
    deliveredCount: number;
    bounceCount: number;
    openedCount: number;
    completedCount: number;
    optOutCount: number;
    responseRate: number;
    totalTokens?: number;
    completedTokens?: number;
    pendingTokens?: number;
    channelBreakdown?: Record<string, number>;
    orgNodeBreakdown?: Record<string, {
        total: number;
        completed: number;
        rate: number;
    }>;
    lastUpdated?: string;
}
export declare class GetCampaignMetricsUseCase {
    private campaignRepo;
    private tokenVaultModelOrRepo?;
    private responseModelOrRepo?;
    constructor(campaignRepo: ISurveyCampaignRepository, tokenVaultModelOrRepo?: any | undefined, responseModelOrRepo?: any | undefined);
    execute(projectId: string, campaignId: string): Promise<CampaignMetricsResult>;
}
