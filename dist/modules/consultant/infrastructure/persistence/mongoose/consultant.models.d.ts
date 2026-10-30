import { Document } from 'mongoose';
import { EngagementStage, EngagementHealth, WorkshopStatus, RiskSeverity } from '../../../domain/entities/consultant.entities';
export interface IClientEngagementDocument extends Document {
    id: string;
    firmId?: string;
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
}
export declare const ClientEngagementModel: import("mongoose").Model<IClientEngagementDocument, {}, {}, {}, Document<unknown, {}, IClientEngagementDocument, {}, {}> & IClientEngagementDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IIndustryBenchmarkDocument extends Document {
    id: string;
    firmId: string;
    metricKey: string;
    metricName: string;
    sector: string;
    p25Score: number;
    p50MedianScore: number;
    p90TopDecileScore: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const IndustryBenchmarkModel: import("mongoose").Model<IIndustryBenchmarkDocument, {}, {}, {}, Document<unknown, {}, IIndustryBenchmarkDocument, {}, {}> & IIndustryBenchmarkDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IExecutiveWorkshopDocument extends Document {
    id: string;
    firmId?: string;
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
}
export declare const ExecutiveWorkshopModel: import("mongoose").Model<IExecutiveWorkshopDocument, {}, {}, {}, Document<unknown, {}, IExecutiveWorkshopDocument, {}, {}> & IExecutiveWorkshopDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IAiSignoffDocument extends Document {
    id: string;
    firmId?: string;
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
}
export declare const AiSignoffModel: import("mongoose").Model<IAiSignoffDocument, {}, {}, {}, Document<unknown, {}, IAiSignoffDocument, {}, {}> & IAiSignoffDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
