"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverrideSentimentUseCase = void 0;
class OverrideSentimentUseCase {
    aiInsightRepo;
    constructor(aiInsightRepo) {
        this.aiInsightRepo = aiInsightRepo;
    }
    async execute(projectId, insightId, overriddenBy, newLabel, reason) {
        const updated = await this.aiInsightRepo.updateHumanOverride(projectId, insightId, overriddenBy, newLabel, reason);
        if (!updated) {
            throw new Error(`AI insight '${insightId}' not found`);
        }
        return updated;
    }
}
exports.OverrideSentimentUseCase = OverrideSentimentUseCase;
//# sourceMappingURL=override-sentiment.use-case.js.map