"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightModel = void 0;
const mongoose_1 = require("mongoose");
const AiInsightSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    responseId: { type: String, required: true, index: true },
    questionId: { type: String, required: true },
    insightId: { type: String, required: true, unique: true, index: true },
    nodeId: { type: String },
    sanitizedText: { type: String, required: true },
    sentimentScore: { type: Number, required: true },
    sentimentLabel: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'], required: true },
    confidence: { type: Number, required: true },
    themes: [{ type: String }],
    riskFlags: [
        {
            category: { type: String, enum: ['SAFETY', 'HARASSMENT', 'BURNOUT', 'COMPLIANCE'] },
            severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            keyword: { type: String },
        },
    ],
    humanOverride: {
        overriddenBy: { type: String },
        originalLabel: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] },
        newLabel: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] },
        reason: { type: String },
        overriddenAt: { type: Date },
    },
    processedAt: { type: Date, required: true },
}, {
    timestamps: false,
    collection: 'ai_insights',
});
AiInsightSchema.index({ projectId: 1, campaignId: 1 });
AiInsightSchema.index({ 'riskFlags.severity': 1 });
exports.AiInsightModel = (0, mongoose_1.model)('AiInsight', AiInsightSchema);
//# sourceMappingURL=ai-insight.schema.js.map