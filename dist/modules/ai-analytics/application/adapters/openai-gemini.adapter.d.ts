import { IAiProviderAdapter, AiInferenceResult } from './ai-provider.adapter.interface';
import { IAiConfigProps } from '../../../project-config/domain/entities/project.entity';
export declare class OpenAiGeminiAdapter implements IAiProviderAdapter {
    private sentimentClassifier;
    private themeClustering;
    private clientAiConfig?;
    constructor(clientAiConfig?: IAiConfigProps);
    setClientConfig(config: IAiConfigProps): void;
    analyzeText(sanitizedText: string): Promise<AiInferenceResult>;
    generateExecutiveSummary(nodeId: string, sanitizedComments: string[]): Promise<{
        strengths: string[];
        concerns: string[];
        recommendations: string[];
    }>;
}
