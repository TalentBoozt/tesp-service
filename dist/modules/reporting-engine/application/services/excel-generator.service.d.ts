import { SurveyResponseEntity } from '../../../response-intake/domain/entities/survey-response.entity';
export declare class ExcelGeneratorService {
    generateRawResponsesXlsx(responses: SurveyResponseEntity[]): Promise<Buffer>;
    generateAggregatedScoresXlsx(nodeAggregates: {
        nodeId: string;
        responseCount: number;
        status: string;
        enps: number | null;
        engagementIndex: number | null;
    }[]): Promise<Buffer>;
}
