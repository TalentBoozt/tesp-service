export interface StatisticalAnomaly {
    id: string;
    orgNodeCode: string;
    orgNodeName: string;
    dimensionKey: string;
    dimensionName: string;
    currentScore: number;
    previousScore: number;
    dropPercentage: number;
    severity: 'HIGH' | 'MEDIUM';
}
export declare class StatisticalEngineService {
    /**
     * Calculates the mean of an array of numbers.
     */
    calculateMean(values: number[]): number;
    /**
     * Calculates the standard deviation of an array of numbers.
     */
    calculateStandardDeviation(values: number[]): number;
    /**
     * Calculates a 95% confidence interval half-width for a given proportion/score.
     */
    calculateConfidenceIntervalDelta(score: number, n: number): number;
    /**
     * Detects statistical score anomalies across organizational nodes and dimensions.
     */
    detectAnomalies(cells: Array<{
        orgNodeCode: string;
        orgNodeName: string;
        dimensionKey: string;
        dimensionName: string;
        score: number;
        responseCount: number;
    }>, benchmarkScore?: number): StatisticalAnomaly[];
}
