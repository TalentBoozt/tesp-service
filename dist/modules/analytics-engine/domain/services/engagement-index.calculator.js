"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementIndexCalculatorService = void 0;
class EngagementIndexCalculatorService {
    calculateIndex(likertScores) {
        if (!likertScores || likertScores.length === 0)
            return 0;
        const sum = likertScores.reduce((acc, v) => acc + v, 0);
        const mean = sum / likertScores.length;
        // Map 1-5 scale to 0-100% index: (mean - 1) / (5 - 1) * 100
        const index = ((mean - 1) / 4) * 100;
        return Math.round(index * 10) / 10;
    }
    calculateGroupScores(answers) {
        const groupMap = new Map();
        for (const a of answers) {
            if (a.groupId && a.numericValue !== undefined) {
                if (!groupMap.has(a.groupId)) {
                    groupMap.set(a.groupId, []);
                }
                groupMap.get(a.groupId).push(a.numericValue);
            }
        }
        const results = [];
        for (const [groupId, scores] of groupMap.entries()) {
            results.push({
                groupId,
                score: this.calculateIndex(scores),
            });
        }
        return results;
    }
}
exports.EngagementIndexCalculatorService = EngagementIndexCalculatorService;
//# sourceMappingURL=engagement-index.calculator.js.map