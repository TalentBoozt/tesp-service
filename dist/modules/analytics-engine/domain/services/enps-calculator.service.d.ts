export interface EnpsCalculationResult {
    eNPS: number;
    totalResponses: number;
    promoters: number;
    passives: number;
    detractors: number;
    promoterPercent: number;
    passivePercent: number;
    detractorPercent: number;
}
export declare class EnpsCalculatorService {
    calculateEnps(scores: number[]): EnpsCalculationResult;
}
