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
        if (!sanitizedComments || sanitizedComments.length === 0) {
            return {
                strengths: [],
                concerns: [],
                recommendations: [],
            };
        }
        const analyzed = sanitizedComments.map((text) => ({
            text,
            sentiment: this.sentimentClassifier.classifyText(text),
            themes: this.themeClustering.extractThemes(text),
        }));
        const pos = analyzed.filter((a) => a.sentiment.sentimentLabel === 'POSITIVE');
        const neg = analyzed.filter((a) => a.sentiment.sentimentLabel === 'NEGATIVE');
        const strengths = [];
        for (const p of pos.slice(0, 3)) {
            const theme = p.themes[0] || 'Workplace Atmosphere';
            strengths.push(`Positive feedback regarding ${theme}: "${p.text}"`);
        }
        if (strengths.length === 0 && pos.length === 0) {
            strengths.push('Team maintains baseline performance and steady operational continuity.');
        }
        const concerns = [];
        for (const n of neg.slice(0, 3)) {
            const theme = n.themes[0] || 'Workplace Environment';
            concerns.push(`Identified area of friction in ${theme}: "${n.text}"`);
        }
        if (concerns.length === 0) {
            concerns.push('No severe qualitative concerns flagged in submitted responses.');
        }
        const recommendations = [];
        if (neg.length > 0) {
            const negThemes = Array.from(new Set(neg.flatMap((n) => n.themes)));
            for (const t of negThemes.slice(0, 3)) {
                recommendations.push(`Initiate management action plan to address reported ${t} concerns.`);
            }
        }
        else {
            recommendations.push('Maintain active listening channels and continue current supportive practices.');
        }
        return {
            strengths,
            concerns,
            recommendations,
        };
    }
}
exports.MockLocalAdapter = MockLocalAdapter;
//# sourceMappingURL=mock-local.adapter.js.map