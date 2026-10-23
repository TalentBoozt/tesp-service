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
export declare class AiKeyDriverService {
    analyzeKeyDrivers(groupScores: {
        groupId: string;
        score: number;
    }[]): KeyDriver[];
    detectAnomalies(currentScores: {
        nodeId: string;
        score: number;
    }[], baselineScores: Map<string, number>): AnomalyAlert[];
}
