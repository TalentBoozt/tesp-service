"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeTextResponsesUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
const pii_sanitizer_service_1 = require("../../domain/services/pii-sanitizer.service");
const risk_scanner_service_1 = require("../../domain/services/risk-scanner.service");
const ai_insight_entity_1 = require("../../domain/entities/ai-insight.entity");
const workplace_risk_alert_event_1 = require("../../domain/events/workplace-risk-alert.event");
const openai_gemini_adapter_1 = require("../adapters/openai-gemini.adapter");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
class AnalyzeTextResponsesUseCase {
    aiInsightRepo;
    responseRepo;
    aiProvider;
    eventBus;
    projectConfigRepo;
    piiSanitizer;
    riskScanner;
    constructor(aiInsightRepo, responseRepo, aiProvider = new openai_gemini_adapter_1.OpenAiGeminiAdapter(), eventBus = event_bus_1.DomainEventBus.getInstance(), projectConfigRepo) {
        this.aiInsightRepo = aiInsightRepo;
        this.responseRepo = responseRepo;
        this.aiProvider = aiProvider;
        this.eventBus = eventBus;
        this.projectConfigRepo = projectConfigRepo;
        this.piiSanitizer = new pii_sanitizer_service_1.PiiSanitizerService();
        this.riskScanner = new risk_scanner_service_1.RiskScannerService();
    }
    async execute(projectId, campaignId) {
        if (this.projectConfigRepo) {
            try {
                const project = await this.projectConfigRepo.findByProjectId(projectId);
                if (project?.aiConfig) {
                    if (typeof this.aiProvider.setClientConfig === 'function') {
                        this.aiProvider.setClientConfig(project.aiConfig);
                    }
                }
            }
            catch (err) {
                console.warn(`[AI-Analytics] Could not load project AI config for ${projectId}:`, err?.message || err);
            }
        }
        const { responses } = await this.responseRepo.findAllByCampaign(projectId, campaignId, { limit: 10000 });
        let processedCount = 0;
        let criticalRiskCount = 0;
        for (const res of responses) {
            for (const ans of res.answers) {
                if (ans.textValue && ans.textValue.trim().length >= 3) {
                    // 1. PII Sanitization Pre-Processing (BR-AI-001, TC-AI-001)
                    const { sanitizedText } = this.piiSanitizer.sanitize(ans.textValue);
                    this.piiSanitizer.assertZeroPii(sanitizedText);
                    // 2. Workplace Risk Scanning (FR-AI-004, TC-AI-002)
                    const riskFlags = this.riskScanner.scan(sanitizedText);
                    const criticalRisk = riskFlags.find((r) => r.severity === 'CRITICAL');
                    if (criticalRisk) {
                        criticalRiskCount++;
                        // Emit Risk Event (BR-AI-004)
                        const event = new workplace_risk_alert_event_1.WorkplaceRiskAlertEvent({
                            projectId,
                            campaignId,
                            responseId: res.responseId,
                            questionId: ans.questionId,
                            nodeId: res.nodeId,
                            category: criticalRisk.category,
                            severity: criticalRisk.severity,
                            keyword: criticalRisk.keyword,
                            sanitizedSnippet: sanitizedText,
                        });
                        await this.eventBus.publish(event);
                    }
                    // 3. AI Provider Inference (FR-AI-002, FR-AI-005)
                    const inference = await this.aiProvider.analyzeText(sanitizedText);
                    // 4. Save Insight Entity
                    const insightId = `INS-${crypto_1.default.randomInt(10000000, 100000000)}`;
                    const insight = new ai_insight_entity_1.AiInsightEntity({
                        projectId,
                        campaignId,
                        responseId: res.responseId,
                        questionId: ans.questionId,
                        insightId,
                        nodeId: res.nodeId,
                        sanitizedText,
                        sentimentScore: inference.sentimentScore,
                        sentimentLabel: inference.sentimentLabel,
                        confidence: inference.confidence,
                        themes: inference.themes,
                        riskFlags,
                        isAiSimulated: inference.isAiSimulated,
                        fallbackReason: inference.fallbackReason,
                    });
                    await this.aiInsightRepo.save(insight);
                    processedCount++;
                }
            }
        }
        return {
            campaignId,
            processedCount,
            criticalRiskCount,
        };
    }
}
exports.AnalyzeTextResponsesUseCase = AnalyzeTextResponsesUseCase;
//# sourceMappingURL=analyze-text-responses.use-case.js.map