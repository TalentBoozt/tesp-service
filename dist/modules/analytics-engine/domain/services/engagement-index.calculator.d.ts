export declare class EngagementIndexCalculatorService {
    calculateIndex(likertScores: number[]): number;
    calculateGroupScores(answers: {
        groupId?: string;
        numericValue?: number;
    }[]): {
        groupId: string;
        score: number;
    }[];
}
