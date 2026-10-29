import { IAiProviderAdapter, AiInferenceResult } from './ai-provider.adapter.interface';
import { IAiConfigProps } from '../../../project-config/domain/entities/project.entity';
export interface ExecutiveSummaryResponse {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    isAiSimulated?: boolean;
}
export declare class OpenAiGeminiAdapter implements IAiProviderAdapter {
    private sentimentClassifier;
    private themeClustering;
    private clientAiConfig?;
    constructor(clientAiConfig?: IAiConfigProps);
    setClientConfig(config: IAiConfigProps): void;
    isConfigured(): boolean;
    /**
     * Resolve active API key either from tenant ProjectConfig or environment variables
     */
    private resolveApiKey;
    /**
     * Determine the effective AI provider
     */
    private resolveProvider;
    /**
     * Perform single-text sentiment and thematic inference
     */
    analyzeText(sanitizedText: string): Promise<AiInferenceResult>;
    /**
     * Synthesize executive insights, concerns, and strategic recommendations from employee comments
     */
    generateExecutiveSummary(nodeId: string, sanitizedComments: string[]): Promise<ExecutiveSummaryResponse>;
    private callOpenAiAnalyze;
    private callOpenAiSummary;
    private callGeminiAnalyze;
    private callGeminiSummary;
    private fetchWithRetry;
    private generateDynamicLocalSummary;
}
