import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { AiInsightEntity, SentimentLabel } from '../../domain/entities/ai-insight.entity';
export declare class OverrideSentimentUseCase {
    private aiInsightRepo;
    constructor(aiInsightRepo: IAiInsightRepository);
    execute(projectId: string, insightId: string, overriddenBy: string, newLabel: SentimentLabel, reason?: string): Promise<AiInsightEntity>;
}
