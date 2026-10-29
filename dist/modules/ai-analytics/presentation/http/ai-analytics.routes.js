"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAiAnalyticsRouter = createAiAnalyticsRouter;
const express_1 = require("express");
const ai_insight_repository_1 = require("../../infrastructure/persistence/mongoose/ai-insight.repository");
const survey_response_repository_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.repository");
const analyze_text_responses_use_case_1 = require("../../application/use-cases/analyze-text-responses.use-case");
const get_executive_summary_use_case_1 = require("../../application/use-cases/get-executive-summary.use-case");
const override_sentiment_use_case_1 = require("../../application/use-cases/override-sentiment.use-case");
const get_risk_alerts_use_case_1 = require("../../application/use-cases/get-risk-alerts.use-case");
const ai_copilot_use_case_1 = require("../../application/use-cases/ai-copilot.use-case");
const knowledge_engine_use_case_1 = require("../../application/use-cases/knowledge-engine.use-case");
const ai_analytics_controller_1 = require("./ai-analytics.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const openai_gemini_adapter_1 = require("../../application/adapters/openai-gemini.adapter");
const project_repository_1 = require("../../../project-config/infrastructure/persistence/mongoose/project.repository");
function createAiAnalyticsRouter(aiInsightRepo, responseRepo, aiProvider, projectConfigRepo) {
    const router = (0, express_1.Router)();
    const aiRepo = aiInsightRepo || new ai_insight_repository_1.AiInsightMongoRepository();
    const resRepo = responseRepo || new survey_response_repository_1.SurveyResponseMongoRepository();
    const provider = aiProvider || new openai_gemini_adapter_1.OpenAiGeminiAdapter();
    const projRepo = projectConfigRepo || (aiInsightRepo ? undefined : new project_repository_1.ProjectMongoRepository());
    const analyzeTextResponsesUseCase = new analyze_text_responses_use_case_1.AnalyzeTextResponsesUseCase(aiRepo, resRepo, provider, undefined, projRepo);
    const getExecutiveSummaryUseCase = new get_executive_summary_use_case_1.GetExecutiveSummaryUseCase(aiRepo, provider, resRepo);
    const overrideSentimentUseCase = new override_sentiment_use_case_1.OverrideSentimentUseCase(aiRepo);
    const getRiskAlertsUseCase = new get_risk_alerts_use_case_1.GetRiskAlertsUseCase(aiRepo);
    const aiCopilotUseCase = new ai_copilot_use_case_1.AiCopilotUseCase(resRepo, aiRepo);
    const knowledgeEngineUseCase = new knowledge_engine_use_case_1.KnowledgeEngineUseCase();
    const controller = new ai_analytics_controller_1.AiAnalyticsController(analyzeTextResponsesUseCase, getExecutiveSummaryUseCase, overrideSentimentUseCase, getRiskAlertsUseCase, aiCopilotUseCase, knowledgeEngineUseCase);
    router.use('/ai', auth_middleware_1.authenticate);
    router.post('/ai/analyze', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), controller.analyzeCampaign);
    router.get('/ai/summaries', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getSummary);
    router.put('/ai/insights/:insightId/override', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.overrideSentiment);
    router.get('/ai/risk-alerts', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.getRiskAlerts);
    // FEAT-017: AI Copilot Natural Language Assistant Route
    router.post('/ai/copilot/chat', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.copilotChat);
    // FEAT-018: AI Knowledge Engine HR Policy Document Ingestion Route
    router.post('/ai/knowledge/documents', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.ingestPolicyDocument);
    // FEAT-018: AI Knowledge Engine RAG Policy Context Match Route
    router.get('/ai/knowledge/match', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.matchPolicyContext);
    return router;
}
//# sourceMappingURL=ai-analytics.routes.js.map