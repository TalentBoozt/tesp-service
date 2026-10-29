import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { OpenAiGeminiAdapter } from '../adapters/openai-gemini.adapter';
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
export interface AiSummaryResponse {
    status: 'CONFIGURED' | 'UNAVAILABLE';
    summary?: any;
    message?: string;
}
export declare class AiCopilotUseCase {
    private responseRepo?;
    private aiInsightRepo?;
    private llmAdapter;
    constructor(responseRepo?: ISurveyResponseRepository | undefined, aiInsightRepo?: IAiInsightRepository | undefined, llmAdapter?: OpenAiGeminiAdapter);
    generateSummary(projectId: string, campaignId: string, nodeId?: string): Promise<AiSummaryResponse>;
    execute(request: AiCopilotChatRequest): Promise<AiCopilotChatResponse>;
}
