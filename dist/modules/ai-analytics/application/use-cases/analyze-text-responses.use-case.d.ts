import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiProviderAdapter } from '../adapters/ai-provider.adapter.interface';
export interface AnalyzeResult {
    campaignId: string;
    processedCount: number;
    criticalRiskCount: number;
}
export declare class AnalyzeTextResponsesUseCase {
    private aiInsightRepo;
    private responseRepo;
    private aiProvider;
    private piiSanitizer;
    private riskScanner;
    constructor(aiInsightRepo: IAiInsightRepository, responseRepo: ISurveyResponseRepository, aiProvider?: IAiProviderAdapter);
    execute(projectId: string, campaignId: string): Promise<AnalyzeResult>;
}
