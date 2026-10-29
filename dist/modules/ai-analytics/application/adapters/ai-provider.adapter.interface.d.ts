import { SentimentLabel } from '../../domain/entities/ai-insight.entity';
export interface AiInferenceResult {
    sentimentScore: number;
    sentimentLabel: SentimentLabel;
    confidence: number;
    themes: string[];
    isAiSimulated?: boolean;
    fallbackReason?: string;
}
export interface IAiProviderAdapter {
    analyzeText(sanitizedText: string): Promise<AiInferenceResult>;
    generateExecutiveSummary(nodeId: string, sanitizedComments: string[]): Promise<{
        strengths: string[];
        concerns: string[];
        recommendations: string[];
    }>;
}
