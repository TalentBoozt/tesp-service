import { AiInsightEntity, SentimentLabel } from '../entities/ai-insight.entity';
export interface IAiInsightRepository {
    save(insight: AiInsightEntity): Promise<AiInsightEntity>;
    findByInsightId(projectId: string, insightId: string): Promise<AiInsightEntity | null>;
    findAllByCampaign(projectId: string, campaignId: string, nodeId?: string): Promise<AiInsightEntity[]>;
    findRiskAlerts(projectId: string, campaignId: string): Promise<AiInsightEntity[]>;
    updateHumanOverride(projectId: string, insightId: string, overriddenBy: string, newLabel: SentimentLabel, reason?: string): Promise<AiInsightEntity | null>;
}
