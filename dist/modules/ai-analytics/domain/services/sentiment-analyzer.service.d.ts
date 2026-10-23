import { SentimentLabel } from '../entities/ai-insight.entity';
export interface SentimentAnalysisResult {
    sentimentScore: number;
    sentimentLabel: SentimentLabel;
    confidence: number;
    matchedTokens: {
        token: string;
        weight: number;
    }[];
}
/**
 * Resilient, local rule-based Sentiment Analyzer using a weighted
 * valence dictionary (AFINN/VADER style) requiring zero external API keys.
 */
export declare class SentimentAnalyzerService {
    private static readonly VALENCE_DICT;
    private static readonly INTENSIFIERS;
    private static readonly NEGATORS;
    analyze(text: string): SentimentAnalysisResult;
}
