import { SentimentLabel } from '../entities/ai-insight.entity';
export interface SentimentClassificationResult {
    sentimentScore: number;
    sentimentLabel: SentimentLabel;
    confidence: number;
}
export declare class SentimentClassifierService {
    private analyzer;
    classifyText(text: string): SentimentClassificationResult;
}
