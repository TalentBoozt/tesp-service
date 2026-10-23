"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentClassifierService = void 0;
const sentiment_analyzer_service_1 = require("./sentiment-analyzer.service");
class SentimentClassifierService {
    analyzer = new sentiment_analyzer_service_1.SentimentAnalyzerService();
    classifyText(text) {
        const result = this.analyzer.analyze(text);
        return {
            sentimentScore: result.sentimentScore,
            sentimentLabel: result.sentimentLabel,
            confidence: result.confidence,
        };
    }
}
exports.SentimentClassifierService = SentimentClassifierService;
//# sourceMappingURL=sentiment-classifier.service.js.map