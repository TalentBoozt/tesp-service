"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticalEngineService = void 0;
class StatisticalEngineService {
    /**
     * Calculates the mean of an array of numbers.
     */
    calculateMean(values) {
        if (!values || values.length === 0)
            return 0;
        const sum = values.reduce((acc, v) => acc + v, 0);
        return Number((sum / values.length).toFixed(2));
    }
    /**
     * Calculates the standard deviation of an array of numbers.
     */
    calculateStandardDeviation(values) {
        if (!values || values.length <= 1)
            return 0;
        const mean = this.calculateMean(values);
        const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1);
        return Number(Math.sqrt(variance).toFixed(2));
    }
    /**
     * Calculates a 95% confidence interval half-width for a given proportion/score.
     */
    calculateConfidenceIntervalDelta(score, n) {
        if (n <= 0)
            return 0;
        const p = Math.max(0, Math.min(1, score / 100));
        const se = Math.sqrt((p * (1 - p)) / n);
        return Number((1.96 * se * 100).toFixed(1));
    }
    /**
     * Detects statistical score anomalies across organizational nodes and dimensions.
     */
    detectAnomalies(cells, benchmarkScore = 75) {
        const anomalies = [];
        // Group cells by dimension to determine dimension averages
        const dimensionScoresMap = new Map();
        for (const cell of cells) {
            if (!dimensionScoresMap.has(cell.dimensionKey)) {
                dimensionScoresMap.set(cell.dimensionKey, []);
            }
            dimensionScoresMap.get(cell.dimensionKey).push(cell.score);
        }
        let anomalyIndex = 1;
        for (const cell of cells) {
            const dimensionScores = dimensionScoresMap.get(cell.dimensionKey) || [];
            const dimensionMean = dimensionScores.length > 0 ? this.calculateMean(dimensionScores) : benchmarkScore;
            const expectedBaseline = Math.max(dimensionMean, benchmarkScore);
            if (expectedBaseline > 0 && cell.score < expectedBaseline) {
                const dropPercentage = Number((((expectedBaseline - cell.score) / expectedBaseline) * 100).toFixed(1));
                if (dropPercentage >= 10.0) {
                    anomalies.push({
                        id: `anom-${String(anomalyIndex++).padStart(3, '0')}`,
                        orgNodeCode: cell.orgNodeCode,
                        orgNodeName: cell.orgNodeName,
                        dimensionKey: cell.dimensionKey,
                        dimensionName: cell.dimensionName,
                        currentScore: cell.score,
                        previousScore: Number(expectedBaseline.toFixed(1)),
                        dropPercentage,
                        severity: dropPercentage >= 15.0 ? 'HIGH' : 'MEDIUM',
                    });
                }
            }
        }
        return anomalies;
    }
}
exports.StatisticalEngineService = StatisticalEngineService;
//# sourceMappingURL=statistical-engine.service.js.map