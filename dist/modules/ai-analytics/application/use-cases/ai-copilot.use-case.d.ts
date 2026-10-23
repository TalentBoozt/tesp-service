import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
export interface AiCopilotChatRequest {
    projectId: string;
    campaignId: string;
    query: string;
    nodeId?: string;
}
export interface AiCopilotChatResponse {
    answer: string;
    suggestedFollowUps: string[];
    keyDrivers?: string[];
    confidence: number;
}
export declare class AiCopilotUseCase {
    private responseRepo?;
    private aiInsightRepo?;
    constructor(responseRepo?: ISurveyResponseRepository | undefined, aiInsightRepo?: IAiInsightRepository | undefined);
    execute(request: AiCopilotChatRequest): Promise<AiCopilotChatResponse>;
}
