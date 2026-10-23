"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeTextResponsesUseCase = void 0;
const pii_sanitizer_service_1 = require("../../domain/services/pii-sanitizer.service");
const risk_scanner_service_1 = require("../../domain/services/risk-scanner.service");
const ai_insight_entity_1 = require("../../domain/entities/ai-insight.entity");
const workplace_risk_alert_event_1 = require("../../domain/events/workplace-risk-alert.event");
const openai_gemini_adapter_1 = require("../adapters/openai-gemini.adapter");
class AnalyzeTextResponsesUseCase {
    aiInsightRepo;
    responseRepo;
    aiProvider;
    piiSanitizer;
    riskScanner;
    constructor(aiInsightRepo, responseRepo, aiProvider = new openai_gemini_adapter_1.OpenAiGeminiAdapter()) {
        this.aiInsightRepo = aiInsightRepo;
        this.responseRepo = responseRepo;
        this.aiProvider = aiProvider;
        this.piiSanitizer = new pii_sanitizer_service_1.PiiSanitizerService();
        this.riskScanner = new risk_scanner_service_1.RiskScannerService();
    }
    async execute(projectId, campaignId) {
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
                        new workplace_risk_alert_event_1.WorkplaceRiskAlertEvent({
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
                    }
                    // 3. AI Provider Inference (FR-AI-002, FR-AI-005)
                    const inference = await this.aiProvider.analyzeText(sanitizedText);
                    // 4. Save Insight Entity
                    const insightId = `INS-${Math.floor(10000000 + Math.random() * 90000000)}`;
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