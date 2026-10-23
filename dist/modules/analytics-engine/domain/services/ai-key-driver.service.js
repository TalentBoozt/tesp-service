"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiKeyDriverService = void 0;
class AiKeyDriverService {
    analyzeKeyDrivers(groupScores) {
        if (!groupScores || groupScores.length === 0)
            return [];
        // Multiple linear regression weighting simulation mapping themes to key drivers
        return groupScores.map((g, index) => {
            const weight = Math.round((0.85 - index * 0.12) * 100) / 100;
            return {
                groupId: g.groupId,
                themeName: g.groupId.replace('GRP-', '').replace(/_/g, ' '),
                correlationWeight: Math.max(0.3, weight),
                impactPercentage: Math.round(Math.max(0.3, weight) * 45),
            };
        }).sort((a, b) => b.correlationWeight - a.correlationWeight);
    }
    detectAnomalies(currentScores, baselineScores) {
        const alerts = [];
        for (const curr of currentScores) {
            const baseline = baselineScores.get(curr.nodeId);
            if (baseline !== undefined && baseline > 0) {
                const drop = Math.round(((baseline - curr.score) / baseline) * 1000) / 10;
                if (drop >= 10.0) {
                    alerts.push({
                        nodeId: curr.nodeId,
                        baselineScore: baseline,
                        currentScore: curr.score,
                        dropPercentage: drop,
                        alertLevel: drop >= 15.0 ? 'HIGH' : 'MEDIUM',
                    });
                }
            }
        }
        return alerts;
    }
}
exports.AiKeyDriverService = AiKeyDriverService;
//# sourceMappingURL=ai-key-driver.service.js.map