import { Request, Response, NextFunction } from 'express';
import { AnalyzeTextResponsesUseCase } from '../../application/use-cases/analyze-text-responses.use-case';
import { GetExecutiveSummaryUseCase } from '../../application/use-cases/get-executive-summary.use-case';
import { OverrideSentimentUseCase } from '../../application/use-cases/override-sentiment.use-case';
import { GetRiskAlertsUseCase } from '../../application/use-cases/get-risk-alerts.use-case';
import { AiCopilotUseCase } from '../../application/use-cases/ai-copilot.use-case';
import { KnowledgeEngineUseCase } from '../../application/use-cases/knowledge-engine.use-case';
export declare class AiAnalyticsController {
    private analyzeTextResponsesUseCase;
    private getExecutiveSummaryUseCase;
    private overrideSentimentUseCase;
    private getRiskAlertsUseCase;
    private aiCopilotUseCase;
    private knowledgeEngineUseCase;
    constructor(analyzeTextResponsesUseCase: AnalyzeTextResponsesUseCase, getExecutiveSummaryUseCase: GetExecutiveSummaryUseCase, overrideSentimentUseCase: OverrideSentimentUseCase, getRiskAlertsUseCase: GetRiskAlertsUseCase, aiCopilotUseCase?: AiCopilotUseCase, knowledgeEngineUseCase?: KnowledgeEngineUseCase);
    analyzeCampaign: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSummary: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    overrideSentiment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRiskAlerts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    copilotChat: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    ingestPolicyDocument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    matchPolicyContext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
