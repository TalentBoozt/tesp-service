import { IAiProviderAdapter, AiInferenceResult } from './ai-provider.adapter.interface';
export declare class MockLocalAdapter implements IAiProviderAdapter {
    private sentimentClassifier;
    private themeClustering;
    constructor();
    analyzeText(sanitizedText: string): Promise<AiInferenceResult>;
    generateExecutiveSummary(nodeId: string, sanitizedComments: string[]): Promise<{
        strengths: string[];
        concerns: string[];
        recommendations: string[];
    }>;
}
