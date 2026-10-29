export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type RiskCategory = 'SAFETY' | 'HARASSMENT' | 'BURNOUT' | 'COMPLIANCE';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface RiskFlag {
    category: RiskCategory;
    severity: RiskSeverity;
    keyword: string;
}
export interface HumanOverride {
    overriddenBy: string;
    originalLabel: SentimentLabel;
    newLabel: SentimentLabel;
    reason?: string;
    overriddenAt: Date;
}
export interface AiInsightProps {
    projectId: string;
    campaignId: string;
    responseId: string;
    questionId: string;
    insightId: string;
    nodeId?: string;
    sanitizedText: string;
    sentimentScore: number;
    sentimentLabel: SentimentLabel;
    confidence: number;
    themes?: string[];
    riskFlags?: RiskFlag[];
    humanOverride?: HumanOverride;
    processedAt?: Date;
    isAiSimulated?: boolean;
    fallbackReason?: string;
}
export declare class AiInsightEntity {
    readonly projectId: string;
    readonly campaignId: string;
    readonly responseId: string;
    readonly questionId: string;
    readonly insightId: string;
    readonly nodeId?: string;
    readonly sanitizedText: string;
    readonly sentimentScore: number;
    readonly sentimentLabel: SentimentLabel;
    readonly confidence: number;
    readonly themes: string[];
    readonly riskFlags: RiskFlag[];
    readonly humanOverride?: HumanOverride;
    readonly processedAt: Date;
    readonly isAiSimulated?: boolean;
    readonly fallbackReason?: string;
    constructor(props: AiInsightProps);
    private validateInsightId;
    private validateScores;
    toJSON(): AiInsightProps;
}
