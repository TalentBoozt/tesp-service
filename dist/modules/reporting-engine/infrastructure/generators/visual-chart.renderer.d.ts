export interface ChartDimensionScore {
    name: string;
    score: number;
    benchmark: number;
}
export interface SentimentDistribution {
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
}
export declare class VisualChartRenderer {
    /**
     * 1. Radial eNPS Semi-Gauge SVG (-100 to +100)
     */
    renderEnpsGauge(enpsScore: number, width?: number, height?: number): string;
    /**
     * 2. Participation Donut Chart SVG
     */
    renderParticipationDonut(completedPercent: number, startedPercent?: number, width?: number, height?: number): string;
    /**
     * 3. Driver Score Horizontal Comparison Bar Chart SVG
     */
    renderDriverScoreBars(drivers: ChartDimensionScore[], width?: number, height?: number): string;
    /**
     * 4. AI Sentiment Polarity Stacked Bar SVG
     */
    renderSentimentStackedBar(sentiment: SentimentDistribution, width?: number, height?: number): string;
}
