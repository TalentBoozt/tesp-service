"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSignoffEntity = exports.ExecutiveWorkshopEntity = exports.IndustryBenchmarkEntity = exports.ClientEngagementEntity = void 0;
class ClientEngagementEntity {
    id;
    firmId;
    projectId;
    clientName;
    clientCode;
    sector;
    leadConsultant;
    stage;
    health;
    responseRate;
    totalEmployees;
    activeSurveys;
    lastDiagnosticDate;
    nextMilestone;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.firmId = props.firmId;
        this.projectId = props.projectId;
        this.clientName = props.clientName;
        this.clientCode = props.clientCode;
        this.sector = props.sector;
        this.leadConsultant = props.leadConsultant;
        this.stage = props.stage;
        this.health = props.health;
        this.responseRate = props.responseRate;
        this.totalEmployees = props.totalEmployees;
        this.activeSurveys = props.activeSurveys;
        this.lastDiagnosticDate = props.lastDiagnosticDate;
        this.nextMilestone = props.nextMilestone;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    toJSON() {
        return {
            id: this.id,
            firmId: this.firmId,
            projectId: this.projectId,
            clientName: this.clientName,
            clientCode: this.clientCode,
            sector: this.sector,
            leadConsultant: this.leadConsultant,
            stage: this.stage,
            health: this.health,
            responseRate: this.responseRate,
            totalEmployees: this.totalEmployees,
            activeSurveys: this.activeSurveys,
            lastDiagnosticDate: this.lastDiagnosticDate,
            nextMilestone: this.nextMilestone,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.ClientEngagementEntity = ClientEngagementEntity;
class IndustryBenchmarkEntity {
    id;
    firmId;
    metricKey;
    metricName;
    sector;
    p25Score;
    p50MedianScore;
    p90TopDecileScore;
    clientScore;
    deltaPercent;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.firmId = props.firmId || 'GLOBAL';
        this.metricKey = props.metricKey;
        this.metricName = props.metricName;
        this.sector = props.sector;
        this.p25Score = props.p25Score;
        this.p50MedianScore = props.p50MedianScore;
        this.p90TopDecileScore = props.p90TopDecileScore;
        this.clientScore = props.clientScore ?? props.p50MedianScore;
        this.deltaPercent =
            props.deltaPercent ??
                (props.p50MedianScore !== 0
                    ? Math.round(((this.clientScore - props.p50MedianScore) / props.p50MedianScore) * 1000) / 10
                    : 0);
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    toJSON() {
        return {
            id: this.id,
            firmId: this.firmId,
            metricKey: this.metricKey,
            metricName: this.metricName,
            sector: this.sector,
            p25Score: this.p25Score,
            p50MedianScore: this.p50MedianScore,
            p90TopDecileScore: this.p90TopDecileScore,
            clientScore: this.clientScore,
            deltaPercent: this.deltaPercent,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.IndustryBenchmarkEntity = IndustryBenchmarkEntity;
class ExecutiveWorkshopEntity {
    id;
    firmId;
    projectId;
    title;
    clientName;
    consultantLead;
    scheduledDate;
    status;
    keyThemes;
    recommendedInterventions;
    actionPlanIds;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.firmId = props.firmId;
        this.projectId = props.projectId;
        this.title = props.title;
        this.clientName = props.clientName;
        this.consultantLead = props.consultantLead;
        this.scheduledDate = props.scheduledDate;
        this.status = props.status;
        this.keyThemes = props.keyThemes ? [...props.keyThemes] : [];
        this.recommendedInterventions = props.recommendedInterventions ? [...props.recommendedInterventions] : [];
        this.actionPlanIds = props.actionPlanIds ? [...props.actionPlanIds] : [];
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    toJSON() {
        return {
            id: this.id,
            firmId: this.firmId,
            projectId: this.projectId,
            title: this.title,
            clientName: this.clientName,
            consultantLead: this.consultantLead,
            scheduledDate: this.scheduledDate,
            status: this.status,
            keyThemes: [...this.keyThemes],
            recommendedInterventions: [...this.recommendedInterventions],
            actionPlanIds: [...this.actionPlanIds],
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.ExecutiveWorkshopEntity = ExecutiveWorkshopEntity;
class AiSignoffEntity {
    id;
    firmId;
    projectId;
    surveyTitle;
    aiGeneratedInsight;
    confidenceScore;
    riskSeverity;
    consultantNotes;
    signedOffBy;
    signedOffAt;
    isVerified;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.firmId = props.firmId;
        this.projectId = props.projectId;
        this.surveyTitle = props.surveyTitle;
        this.aiGeneratedInsight = props.aiGeneratedInsight;
        this.confidenceScore = props.confidenceScore;
        this.riskSeverity = props.riskSeverity;
        this.consultantNotes = props.consultantNotes;
        this.signedOffBy = props.signedOffBy;
        this.signedOffAt = props.signedOffAt;
        this.isVerified = props.isVerified ?? false;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    signoff(notes, consultantEmail) {
        this.consultantNotes = notes;
        this.signedOffBy = consultantEmail;
        this.signedOffAt = new Date().toISOString();
        this.isVerified = true;
        this.updatedAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            firmId: this.firmId,
            projectId: this.projectId,
            surveyTitle: this.surveyTitle,
            aiGeneratedInsight: this.aiGeneratedInsight,
            confidenceScore: this.confidenceScore,
            riskSeverity: this.riskSeverity,
            consultantNotes: this.consultantNotes,
            signedOffBy: this.signedOffBy,
            signedOffAt: this.signedOffAt,
            isVerified: this.isVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.AiSignoffEntity = AiSignoffEntity;
//# sourceMappingURL=consultant.entities.js.map