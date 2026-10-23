"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLocalAdapter = void 0;
const sentiment_classifier_service_1 = require("../../domain/services/sentiment-classifier.service");
const theme_clustering_service_1 = require("../../domain/services/theme-clustering.service");
class MockLocalAdapter {
    sentimentClassifier;
    themeClustering;
    constructor() {
        this.sentimentClassifier = new sentiment_classifier_service_1.SentimentClassifierService();
        this.themeClustering = new theme_clustering_service_1.ThemeClusteringService();
    }
    async analyzeText(sanitizedText) {
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
                'Demonstrated strong team cohesion and supportive supervisor guidance.',
                'High employee engagement regarding recent professional learning initiatives.',
            ],
            concerns: [
                'Occasional equipment maintenance delays affecting productivity.',
                'Need for clearer operational communication during shift transitions.',
            ],
            recommendations: [
                'Implement preventive equipment maintenance checks.',
                'Standardize shift handover communication protocols.',
            ],
        };
    }
}
exports.MockLocalAdapter = MockLocalAdapter;
//# sourceMappingURL=mock-local.adapter.js.map