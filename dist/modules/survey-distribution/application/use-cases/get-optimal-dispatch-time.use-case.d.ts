import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
export interface OptimalDispatchTimeResult {
    nodeId?: string;
    recommendedDayOfWeek: string;
    recommendedTimeUtc: string;
    confidenceScore: number;
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'LOW_TELEMETRY';
    sampleSize?: number;
    isHeuristic?: boolean;
    expectedOpenRatePercent?: number;
    reasoning: string;
}
export declare class GetOptimalDispatchTimeUseCase {
    private responseRepo?;
    constructor(responseRepo?: ISurveyResponseRepository);
    execute(projectId: string, nodeId?: string): Promise<OptimalDispatchTimeResult>;
    private getTimestamps;
}
