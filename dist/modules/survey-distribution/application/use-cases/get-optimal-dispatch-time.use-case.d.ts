export interface OptimalDispatchTimeResult {
    nodeId?: string;
    recommendedDayOfWeek: string;
    recommendedTimeUtc: string;
    confidenceScore: number;
    expectedOpenRatePercent: number;
    reasoning: string;
}
export declare class GetOptimalDispatchTimeUseCase {
    execute(projectId: string, nodeId?: string): Promise<OptimalDispatchTimeResult>;
}
