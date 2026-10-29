export interface KeyDriver {
    groupId: string;
    themeName: string;
    correlationWeight: number;
    impactPercentage: number;
}
export interface AnomalyAlert {
    nodeId?: string;
    groupId?: string;
    baselineScore: number;
    currentScore: number;
    dropPercentage: number;
    alertLevel: 'HIGH' | 'MEDIUM';
}
export interface RespondentDimensionScore {
    overallScore: number;
    dimensionScores?: Record<string, number>;
    [key: string]: any;
}
export declare class AiKeyDriverService {
    private formatThemeName;
    /**
     * Calculates the bivariate Pearson correlation coefficient r between paired numeric values:
     * r = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \sum (y - \bar{y})^2}}
     * Returns a value between -1.0 and 1.0, or 0 if sample size < 2 or variance is zero.
     */
    calculateCorrelationWeights(pairs: {
        x: number;
        y: number;
    }[]): number;
    calculatePearsonCorrelation(pairs: {
        x: number;
        y: number;
    }[]): number;
    private normalizePercentages;
    analyzeKeyDrivers(inputData: any[], specifiedDimensions?: string[]): KeyDriver[];
    detectAnomalies(currentScores: {
        nodeId: string;
        score: number;
    }[], baselineScores: Map<string, number>): AnomalyAlert[];
}
