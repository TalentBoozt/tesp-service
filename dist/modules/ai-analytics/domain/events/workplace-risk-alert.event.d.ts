import { RiskCategory, RiskSeverity } from '../entities/ai-insight.entity';
export interface WorkplaceRiskAlertEventPayload {
    eventId: string;
    eventType: 'WORKPLACE_RISK_ALERT';
    projectId: string;
    campaignId: string;
    responseId: string;
    questionId: string;
    nodeId?: string;
    category: RiskCategory;
    severity: RiskSeverity;
    keyword: string;
    sanitizedSnippet: string;
    timestamp: string;
}
export declare class WorkplaceRiskAlertEvent {
    readonly payload: WorkplaceRiskAlertEventPayload;
    constructor(payload: Omit<WorkplaceRiskAlertEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
