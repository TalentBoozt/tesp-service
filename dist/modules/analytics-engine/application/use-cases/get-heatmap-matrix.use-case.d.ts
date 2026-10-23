import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
export interface HeatmapCell {
    nodeId: string;
    orgNodeCode: string;
    orgNodeName: string;
    groupId: string;
    dimensionKey: string;
    dimensionName: string;
    responseCount: number;
    status: 'VALID' | 'SUPPRESSED';
    score: number;
    colorIntensity: 'RED' | 'YELLOW' | 'GREEN' | 'GRAY';
    colorHex: string;
}
export interface HeatmapMatrixResult {
    projectId: string;
    campaignId: string;
    nodes: string[];
    groups: string[];
    cells: HeatmapCell[];
}
export declare class GetHeatmapMatrixUseCase {
    private responseRepo;
    private privacyGuard;
    private engagementCalculator;
    constructor(responseRepo: ISurveyResponseRepository);
    execute(projectId: string, campaignId: string, parentNodeId?: string): Promise<HeatmapMatrixResult>;
}
