export type EngagementStage = 'DIAGNOSTIC' | 'FIELDWORK' | 'AI_SYNTHESIS' | 'EXECUTIVE_WORKSHOP' | 'ACTION_SIGNOFF';
export type EngagementHealth = 'OPTIMAL' | 'ATTENTION' | 'CRITICAL';
export interface ClientEngagementProps {
    id: string;
    projectId: string;
    clientName: string;
    clientCode: string;
    sector: string;
    leadConsultant: string;
    stage: EngagementStage;
    health: EngagementHealth;
    responseRate: number;
    totalEmployees: number;
    activeSurveys: number;
    lastDiagnosticDate: string;
    nextMilestone: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class ClientEngagementEntity {
    id: string;
    projectId: string;
    clientName: string;
    clientCode: string;
    sector: string;
    leadConsultant: string;
    stage: EngagementStage;
    health: EngagementHealth;
    responseRate: number;
    totalEmployees: number;
    activeSurveys: number;
    lastDiagnosticDate: string;
    nextMilestone: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(props: ClientEngagementProps);
    toJSON(): ClientEngagementProps;
}
export interface IndustryBenchmarkProps {
    id: string;
    metricKey: string;
    metricName: string;
    sector: string;
    p25Score: number;
    p50MedianScore: number;
    p90TopDecileScore: number;
    clientScore?: number;
    deltaPercent?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class IndustryBenchmarkEntity {
    id: string;
    metricKey: string;
    metricName: string;
    sector: string;
    p25Score: number;
    p50MedianScore: number;
    p90TopDecileScore: number;
    clientScore: number;
    deltaPercent: number;
    createdAt: Date;
    updatedAt: Date;
    constructor(props: IndustryBenchmarkProps);
    toJSON(): {
        id: string;
        metricKey: string;
        metricName: string;
        sector: string;
        p25Score: number;
        p50MedianScore: number;
        p90TopDecileScore: number;
        clientScore: number;
        deltaPercent: number;
        createdAt: Date;
        updatedAt: Date;
    };
}
export type WorkshopStatus = 'DRAFT' | 'READY_FOR_EXEC' | 'DELIVERED';
export interface ExecutiveWorkshopProps {
    id: string;
    projectId: string;
    title: string;
    clientName: string;
    consultantLead: string;
    scheduledDate: string;
    status: WorkshopStatus;
    keyThemes: string[];
    recommendedInterventions: string[];
    actionPlanIds: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class ExecutiveWorkshopEntity {
    id: string;
    projectId: string;
    title: string;
    clientName: string;
    consultantLead: string;
    scheduledDate: string;
    status: WorkshopStatus;
    keyThemes: string[];
    recommendedInterventions: string[];
    actionPlanIds: string[];
    createdAt: Date;
    updatedAt: Date;
    constructor(props: ExecutiveWorkshopProps);
    toJSON(): ExecutiveWorkshopProps;
}
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface AiSignoffProps {
    id: string;
    projectId: string;
    surveyTitle: string;
    aiGeneratedInsight: string;
    confidenceScore: number;
    riskSeverity: RiskSeverity;
    consultantNotes?: string;
    signedOffBy?: string;
    signedOffAt?: string;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class AiSignoffEntity {
    id: string;
    projectId: string;
    surveyTitle: string;
    aiGeneratedInsight: string;
    confidenceScore: number;
    riskSeverity: RiskSeverity;
    consultantNotes?: string;
    signedOffBy?: string;
    signedOffAt?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(props: AiSignoffProps);
    signoff(notes: string, consultantEmail: string): void;
    toJSON(): AiSignoffProps;
}
