"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightMongoRepository = void 0;
const ai_insight_entity_1 = require("../../../domain/entities/ai-insight.entity");
const ai_insight_schema_1 = require("./ai-insight.schema");
class AiInsightMongoRepository {
    toEntity(doc) {
        return new ai_insight_entity_1.AiInsightEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            responseId: doc.responseId,
            questionId: doc.questionId,
            insightId: doc.insightId,
            nodeId: doc.nodeId,
            sanitizedText: doc.sanitizedText,
            sentimentScore: doc.sentimentScore,
            sentimentLabel: doc.sentimentLabel,
            confidence: doc.confidence,
            themes: doc.themes,
            riskFlags: doc.riskFlags,
            humanOverride: doc.humanOverride,
            processedAt: doc.processedAt,
        });
    }
    async save(insight) {
        const raw = insight.toJSON();
        const doc = await ai_insight_schema_1.AiInsightModel.findOneAndUpdate({ projectId: raw.projectId, insightId: raw.insightId }, {
            $set: {
                campaignId: raw.campaignId,
                responseId: raw.responseId,
                questionId: raw.questionId,
                nodeId: raw.nodeId,
                sanitizedText: raw.sanitizedText,
                sentimentScore: raw.sentimentScore,
                sentimentLabel: raw.sentimentLabel,
                confidence: raw.confidence,
                themes: raw.themes,
                riskFlags: raw.riskFlags,
                humanOverride: raw.humanOverride,
                processedAt: raw.processedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                insightId: raw.insightId,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByInsightId(projectId, insightId) {
        const doc = await ai_insight_schema_1.AiInsightModel.findOne({ projectId, insightId });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAllByCampaign(projectId, campaignId, nodeId) {
        const query = { projectId, campaignId };
        if (nodeId && nodeId !== 'GLOBAL') {
            query.nodeId = nodeId;
        }
        const docs = await ai_insight_schema_1.AiInsightModel.find(query);
        return docs.map((doc) => this.toEntity(doc));
    }
    async findRiskAlerts(projectId, campaignId) {
        const docs = await ai_insight_schema_1.AiInsightModel.find({
            projectId,
            campaignId,
            'riskFlags.0': { $exists: true },
        });
        return docs.map((doc) => this.toEntity(doc));
    }
    async updateHumanOverride(projectId, insightId, overriddenBy, newLabel, reason) {
        const doc = await ai_insight_schema_1.AiInsightModel.findOne({ projectId, insightId });
        if (!doc)
            return null;
        doc.humanOverride = {
            overriddenBy,
            originalLabel: doc.sentimentLabel,
            newLabel,
            reason,
            overriddenAt: new Date(),
        };
        doc.sentimentLabel = newLabel;
        await doc.save();
        return this.toEntity(doc);
    }
}
exports.AiInsightMongoRepository = AiInsightMongoRepository;
//# sourceMappingURL=ai-insight.repository.js.map