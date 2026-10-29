import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiProviderAdapter } from '../adapters/ai-provider.adapter.interface';
export interface AnalyzeResult {
    campaignId: string;
    processedCount: number;
    criticalRiskCount: number;
}
import { IEventBus } from '../../../../shared/domain/events/event-bus';
import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
export declare class AnalyzeTextResponsesUseCase {
    private aiInsightRepo;
    private responseRepo;
    private aiProvider;
    private eventBus;
    private projectConfigRepo?;
    private piiSanitizer;
    private riskScanner;
    constructor(aiInsightRepo: IAiInsightRepository, responseRepo: ISurveyResponseRepository, aiProvider?: IAiProviderAdapter, eventBus?: IEventBus, projectConfigRepo?: IProjectRepository | undefined);
    execute(projectId: string, campaignId: string): Promise<AnalyzeResult>;
}
