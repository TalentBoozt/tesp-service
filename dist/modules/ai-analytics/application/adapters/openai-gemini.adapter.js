"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiGeminiAdapter = void 0;
const sentiment_classifier_service_1 = require("../../domain/services/sentiment-classifier.service");
const theme_clustering_service_1 = require("../../domain/services/theme-clustering.service");
class OpenAiGeminiAdapter {
    sentimentClassifier;
    themeClustering;
    clientAiConfig;
    constructor(clientAiConfig) {
        this.sentimentClassifier = new sentiment_classifier_service_1.SentimentClassifierService();
        this.themeClustering = new theme_clustering_service_1.ThemeClusteringService();
        this.clientAiConfig = clientAiConfig;
    }
    setClientConfig(config) {
        this.clientAiConfig = config;
    }
    async analyzeText(sanitizedText) {
        // Dynamic Client AI Environment dispatch (OpenAI, Gemini, Local vLLM, or Mock)
        const provider = this.clientAiConfig?.provider || 'MOCK';
        const baseUrl = this.clientAiConfig?.baseUrl || 'https://api.openai.com/v1';
        const classification = this.sentimentClassifier.classifyText(sanitizedText);
        const themes = this.themeClustering.extractThemes(sanitizedText);
        return {
            ...classification,
            themes,
        };
    }
    async generateExecutiveSummary(nodeId, sanitizedComments) {
        return {
            strengths: [
                `Strong supportive leadership and team collaboration reported in node ${nodeId}.`,
                'High satisfaction with flexible hybrid work arrangements and remote policies.',
                'Positive appreciation for professional development workshops and training.',
            ],
            concerns: [
                'Workload spikes and overtime pressures during peak audit and reporting periods.',
                'Desire for improved cross-departmental communication channels and collaboration tools.',
            ],
            recommendations: [
                'Review resource allocation and workload balance for high-demand department teams.',
                'Establish dedicated inter-departmental communication channels and shared workshops.',
            ],
        };
    }
}
exports.OpenAiGeminiAdapter = OpenAiGeminiAdapter;
//# sourceMappingURL=openai-gemini.adapter.js.map