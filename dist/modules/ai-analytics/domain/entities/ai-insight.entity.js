"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightEntity = void 0;
class AiInsightEntity {
    projectId;
    campaignId;
    responseId;
    questionId;
    insightId;
    nodeId;
    sanitizedText;
    sentimentScore;
    sentimentLabel;
    confidence;
    themes;
    riskFlags;
    humanOverride;
    processedAt;
    isAiSimulated;
    fallbackReason;
    constructor(props) {
        if (!props.projectId || !props.campaignId || !props.responseId || !props.questionId) {
            throw new Error('projectId, campaignId, responseId, and questionId are required');
        }
        this.validateInsightId(props.insightId);
        this.validateScores(props.sentimentScore, props.confidence);
        this.projectId = props.projectId;
        this.campaignId = props.campaignId;
        this.responseId = props.responseId;
        this.questionId = props.questionId;
        this.insightId = props.insightId;
        this.nodeId = props.nodeId;
        this.sanitizedText = props.sanitizedText;
        this.sentimentScore = props.sentimentScore;
        this.sentimentLabel = props.sentimentLabel;
        this.confidence = props.confidence;
        this.themes = props.themes ? [...props.themes] : [];
        this.riskFlags = props.riskFlags ? [...props.riskFlags] : [];
        this.humanOverride = props.humanOverride ? { ...props.humanOverride } : undefined;
        this.processedAt = props.processedAt || new Date();
        this.isAiSimulated = props.isAiSimulated;
        this.fallbackReason = props.fallbackReason;
    }
    validateInsightId(insightId) {
        const pattern = /^INS-[A-Za-z0-9_-]{3,50}$/;
        if (!pattern.test(insightId)) {
            throw new Error(`Invalid Insight ID format: '${insightId}'. Must match pattern ^INS-[A-Za-z0-9_-]{3,50}$`);
        }
    }
    validateScores(sentimentScore, confidence) {
        if (sentimentScore < -1.0 || sentimentScore > 1.0) {
            throw new Error(`Invalid sentiment score range: ${sentimentScore}. Must be between -1.0 and +1.0`);
        }
        if (confidence < 0.0 || confidence > 1.0) {
            throw new Error(`Invalid confidence score range: ${confidence}. Must be between 0.0 and 1.0`);
        }
    }
    toJSON() {
        return {
            projectId: this.projectId,
            campaignId: this.campaignId,
            responseId: this.responseId,
            questionId: this.questionId,
            insightId: this.insightId,
            nodeId: this.nodeId,
            sanitizedText: this.sanitizedText,
            sentimentScore: this.sentimentScore,
            sentimentLabel: this.sentimentLabel,
            confidence: this.confidence,
            themes: [...this.themes],
            riskFlags: this.riskFlags.map((r) => ({ ...r })),
            humanOverride: this.humanOverride ? { ...this.humanOverride } : undefined,
            processedAt: this.processedAt,
            isAiSimulated: this.isAiSimulated,
            fallbackReason: this.fallbackReason,
        };
    }
}
exports.AiInsightEntity = AiInsightEntity;
//# sourceMappingURL=ai-insight.entity.js.map