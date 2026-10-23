"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreDeltaEvaluatorService = void 0;
class ScoreDeltaEvaluatorService {
    evaluateDelta(baselineScore, postActionScore) {
        const delta = Math.round((postActionScore - baselineScore) * 10) / 10;
        const isVerified = delta > 0;
        return {
            delta,
            isVerified,
            baselineScore,
            postActionScore,
        };
    }
}
exports.ScoreDeltaEvaluatorService = ScoreDeltaEvaluatorService;
//# sourceMappingURL=score-delta-evaluator.service.js.map