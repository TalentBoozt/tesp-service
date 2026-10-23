"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAnalyticsController = void 0;
const ai_copilot_use_case_1 = require("../../application/use-cases/ai-copilot.use-case");
const knowledge_engine_use_case_1 = require("../../application/use-cases/knowledge-engine.use-case");
const ai_analytics_dto_1 = require("../../application/dto/ai-analytics.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class AiAnalyticsController {
    analyzeTextResponsesUseCase;
    getExecutiveSummaryUseCase;
    overrideSentimentUseCase;
    getRiskAlertsUseCase;
    aiCopilotUseCase;
    knowledgeEngineUseCase;
    constructor(analyzeTextResponsesUseCase, getExecutiveSummaryUseCase, overrideSentimentUseCase, getRiskAlertsUseCase, aiCopilotUseCase = new ai_copilot_use_case_1.AiCopilotUseCase(), knowledgeEngineUseCase = new knowledge_engine_use_case_1.KnowledgeEngineUseCase()) {
        this.analyzeTextResponsesUseCase = analyzeTextResponsesUseCase;
        this.getExecutiveSummaryUseCase = getExecutiveSummaryUseCase;
        this.overrideSentimentUseCase = overrideSentimentUseCase;
        this.getRiskAlertsUseCase = getRiskAlertsUseCase;
        this.aiCopilotUseCase = aiCopilotUseCase;
        this.knowledgeEngineUseCase = knowledgeEngineUseCase;
    }
    analyzeCampaign = async (req, res, next) => {
        try {
            const { campaignId, projectId: bodyProjectId } = req.body;
            const projectId = bodyProjectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId is required in body');
            }
            const result = await this.analyzeTextResponsesUseCase.execute(projectId, campaignId);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getSummary = async (req, res, next) => {
        try {
            const campaignId = req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const nodeId = req.query.nodeId || 'GLOBAL';
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const summary = await this.getExecutiveSummaryUseCase.execute(projectId, campaignId, nodeId);
            res.status(200).json(summary);
        }
        catch (err) {
            next(err);
        }
    };
    overrideSentiment = async (req, res, next) => {
        try {
            const { insightId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const parsed = ai_analytics_dto_1.OverrideSentimentDtoSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail);
            }
            const overriddenBy = req.user?.userId || 'USR-ADMIN';
            const updated = await this.overrideSentimentUseCase.execute(projectId, insightId, overriddenBy, parsed.data.newSentimentLabel, parsed.data.reason);
            res.status(200).json({
                message: 'Sentiment tag overridden successfully',
                insight: updated.toJSON(),
            });
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message));
                return;
            }
            next(err);
        }
    };
    getRiskAlerts = async (req, res, next) => {
        try {
            const campaignId = req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const alerts = await this.getRiskAlertsUseCase.execute(projectId, campaignId);
            res.status(200).json({
                totalAlerts: alerts.length,
                alerts: alerts.map((a) => a.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
    // FEAT-017: AI Copilot Chat Endpoint
    copilotChat = async (req, res, next) => {
        try {
            const { campaignId, query, message, nodeId, projectId: bodyProjectId } = req.body;
            const projectId = bodyProjectId || req.user?.projectId || 'PRJ-DEFAULT';
            const actualQuery = query || message;
            if (!actualQuery || !campaignId) {
                throw new error_middleware_1.AppError(400, 'query (or message) and campaignId are required');
            }
            const result = await this.aiCopilotUseCase.execute({
                projectId,
                campaignId,
                query: actualQuery,
                nodeId,
            });
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    // FEAT-018: AI Knowledge Engine Document Ingestion Endpoint
    ingestPolicyDocument = async (req, res, next) => {
        try {
            const { title, category, content, projectId: bodyProjectId } = req.body;
            const projectId = bodyProjectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!title || !category || !content) {
                throw new error_middleware_1.AppError(400, 'title, category, and content are required');
            }
            const doc = await this.knowledgeEngineUseCase.ingestPolicyDocument(projectId, title, category, content);
            res.status(201).json({
                message: 'HR Policy Document ingested into AI Knowledge RAG index successfully',
                document: doc,
            });
        }
        catch (err) {
            next(err);
        }
    };
    // FEAT-018: AI Knowledge Engine RAG Policy Matching Endpoint
    matchPolicyContext = async (req, res, next) => {
        try {
            const topicOrGroupId = req.query.topic || req.query.groupId || 'GENERAL';
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const matches = await this.knowledgeEngineUseCase.matchPolicyContext(projectId, topicOrGroupId);
            res.status(200).json({
                totalMatches: matches.length,
                matches,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AiAnalyticsController = AiAnalyticsController;
//# sourceMappingURL=ai-analytics.controller.js.map