export interface ScoreDeltaResult {
    delta: number;
    isVerified: boolean;
    baselineScore: number;
    postActionScore: number;
}
export declare class ScoreDeltaEvaluatorService {
    evaluateDelta(baselineScore: number, postActionScore: number): ScoreDeltaResult;
}
