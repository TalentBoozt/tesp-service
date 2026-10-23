import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { AiInsightEntity } from '../../domain/entities/ai-insight.entity';
export declare class GetRiskAlertsUseCase {
    private aiInsightRepo;
    constructor(aiInsightRepo: IAiInsightRepository);
    execute(projectId: string, campaignId: string): Promise<AiInsightEntity[]>;
}
