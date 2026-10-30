"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantMongoRepository = void 0;
const consultant_entities_1 = require("../../../domain/entities/consultant.entities");
const consultant_models_1 = require("./consultant.models");
class ConsultantMongoRepository {
    async findEngagements(projectId, firmId) {
        if (!firmId && (!projectId || projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL')) {
            return []; // Strict tenant isolation: do not permit unconstrained queries
        }
        const query = {};
        if (projectId && projectId !== 'GLOBAL' && projectId !== 'PRJ-DEFAULT')
            query.projectId = projectId;
        if (firmId && firmId !== 'ALL')
            query.firmId = firmId;
        const docs = await consultant_models_1.ClientEngagementModel.find(query).sort({ updatedAt: -1 });
        return docs.map((d) => new consultant_entities_1.ClientEngagementEntity({
            id: d._id ? d._id.toString() : d.id,
            firmId: d.firmId,
            projectId: d.projectId,
            clientName: d.clientName,
            clientCode: d.clientCode,
            sector: d.sector,
            leadConsultant: d.leadConsultant,
            stage: d.stage,
            health: d.health,
            responseRate: d.responseRate,
            totalEmployees: d.totalEmployees,
            activeSurveys: d.activeSurveys,
            lastDiagnosticDate: d.lastDiagnosticDate,
            nextMilestone: d.nextMilestone,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }
    async findBenchmarks(sector, firmId) {
        const query = {};
        if (sector && sector !== 'ALL') {
            query.sector = sector;
        }
        if (firmId && firmId !== 'ALL') {
            query.$or = [{ firmId: { $in: [firmId, 'GLOBAL'] } }, { firmId: { $exists: false } }];
        }
        const docs = await consultant_models_1.IndustryBenchmarkModel.find(query);
        return docs.map((d) => new consultant_entities_1.IndustryBenchmarkEntity({
            id: d._id ? d._id.toString() : d.id,
            firmId: d.firmId || 'GLOBAL',
            metricKey: d.metricKey,
            metricName: d.metricName,
            sector: d.sector,
            p25Score: d.p25Score,
            p50MedianScore: d.p50MedianScore,
            p90TopDecileScore: d.p90TopDecileScore,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }
    async findWorkshops(projectId, firmId) {
        if (!firmId && (!projectId || projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL')) {
            return []; // Strict tenant isolation
        }
        const query = {};
        if (projectId && projectId !== 'GLOBAL' && projectId !== 'PRJ-DEFAULT')
            query.projectId = projectId;
        if (firmId && firmId !== 'ALL')
            query.firmId = firmId;
        const docs = await consultant_models_1.ExecutiveWorkshopModel.find(query).sort({ scheduledDate: -1 });
        return docs.map((d) => new consultant_entities_1.ExecutiveWorkshopEntity({
            id: d._id ? d._id.toString() : d.id,
            firmId: d.firmId,
            projectId: d.projectId,
            title: d.title,
            clientName: d.clientName,
            consultantLead: d.consultantLead,
            scheduledDate: d.scheduledDate,
            status: d.status,
            keyThemes: d.keyThemes,
            recommendedInterventions: d.recommendedInterventions,
            actionPlanIds: d.actionPlanIds,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }
    async createWorkshop(workshop) {
        if (!workshop.projectId) {
            throw new Error('Project ID is required to create a workshop');
        }
        const doc = await consultant_models_1.ExecutiveWorkshopModel.create({
            firmId: workshop.firmId,
            projectId: workshop.projectId,
            title: workshop.title,
            clientName: workshop.clientName,
            consultantLead: workshop.consultantLead || 'Lead Consultant',
            scheduledDate: workshop.scheduledDate || new Date().toISOString().split('T')[0],
            status: workshop.status || 'READY_FOR_EXEC',
            keyThemes: workshop.keyThemes || [],
            recommendedInterventions: workshop.recommendedInterventions || [],
            actionPlanIds: workshop.actionPlanIds || [],
        });
        return new consultant_entities_1.ExecutiveWorkshopEntity({
            id: doc._id.toString(),
            firmId: doc.firmId,
            projectId: doc.projectId,
            title: doc.title,
            clientName: doc.clientName,
            consultantLead: doc.consultantLead,
            scheduledDate: doc.scheduledDate,
            status: doc.status,
            keyThemes: doc.keyThemes,
            recommendedInterventions: doc.recommendedInterventions,
            actionPlanIds: doc.actionPlanIds,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async updateWorkshop(id, updates) {
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { $or: [{ _id: id }, { id }] } : { $or: [{ id }, { title: id }] };
        const doc = await consultant_models_1.ExecutiveWorkshopModel.findOneAndUpdate(query, { $set: updates }, { new: true });
        if (!doc)
            return null;
        return new consultant_entities_1.ExecutiveWorkshopEntity({
            id: doc._id.toString(),
            firmId: doc.firmId,
            projectId: doc.projectId,
            title: doc.title,
            clientName: doc.clientName,
            consultantLead: doc.consultantLead,
            scheduledDate: doc.scheduledDate,
            status: doc.status,
            keyThemes: doc.keyThemes,
            recommendedInterventions: doc.recommendedInterventions,
            actionPlanIds: doc.actionPlanIds,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async deleteWorkshop(id) {
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { $or: [{ _id: id }, { id }] } : { id };
        const res = await consultant_models_1.ExecutiveWorkshopModel.findOneAndDelete(query);
        return !!res;
    }
    async findSignoffQueue(projectId, firmId) {
        if (!firmId && (!projectId || projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL')) {
            return []; // Strict tenant isolation
        }
        const query = {};
        if (projectId && projectId !== 'GLOBAL' && projectId !== 'PRJ-DEFAULT')
            query.projectId = projectId;
        if (firmId && firmId !== 'ALL')
            query.firmId = firmId;
        const docs = await consultant_models_1.AiSignoffModel.find(query).sort({ createdAt: -1 });
        // Seamlessly enrich with real AI sentiment insights from the survey pipeline
        if (query.projectId) {
            try {
                const { AiInsightModel } = await Promise.resolve().then(() => __importStar(require('../../../../ai-analytics/infrastructure/persistence/mongoose/ai-insight.schema')));
                const aiInsights = await AiInsightModel.find({ projectId: query.projectId }).lean();
                const existingTexts = new Set(docs.map((d) => d.aiGeneratedInsight));
                for (const ins of aiInsights) {
                    const insightText = ins.sanitizedText
                        ? `Flagged ${ins.riskFlags?.[0]?.category || 'Sentiment'} Risk: "${ins.sanitizedText.slice(0, 140)}"`
                        : `AI Sentiment Pattern: ${ins.sentimentLabel} (${Math.round(ins.confidence * 100)}% confidence)`;
                    if (!existingTexts.has(insightText)) {
                        docs.push({
                            _id: ins._id,
                            id: ins.insightId || ins._id.toString(),
                            firmId: firmId || 'GLOBAL',
                            projectId: ins.projectId,
                            surveyTitle: `Survey Campaign AI Diagnostic (${ins.campaignId})`,
                            aiGeneratedInsight: insightText,
                            confidenceScore: Math.round(ins.confidence * 1000) / 10,
                            riskSeverity: ins.riskFlags?.[0]?.severity || (ins.sentimentLabel === 'NEGATIVE' ? 'HIGH' : 'MEDIUM'),
                            consultantNotes: ins.humanOverride?.reason || '',
                            signedOffBy: ins.humanOverride?.overriddenBy || '',
                            signedOffAt: ins.humanOverride?.overriddenAt,
                            isVerified: !!ins.humanOverride?.overriddenBy,
                            createdAt: ins.processedAt || new Date(),
                            updatedAt: new Date(),
                        });
                    }
                }
            }
            catch {
                // ignore if ai-analytics model not available
            }
        }
        return docs.map((d) => new consultant_entities_1.AiSignoffEntity({
            id: d._id ? d._id.toString() : d.id,
            firmId: d.firmId,
            projectId: d.projectId,
            surveyTitle: d.surveyTitle,
            aiGeneratedInsight: d.aiGeneratedInsight,
            confidenceScore: d.confidenceScore,
            riskSeverity: d.riskSeverity,
            consultantNotes: d.consultantNotes,
            signedOffBy: d.signedOffBy,
            signedOffAt: d.signedOffAt,
            isVerified: d.isVerified,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }
    async findSignoffById(id) {
        const isObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        let doc = null;
        if (isObjectId) {
            doc = await consultant_models_1.AiSignoffModel.findById(id).catch(() => null);
        }
        if (!doc) {
            doc = await consultant_models_1.AiSignoffModel.findOne({
                $or: [{ _id: isObjectId ? id : null }, { id }],
            }).catch(() => null);
        }
        if (!doc)
            return null;
        return new consultant_entities_1.AiSignoffEntity({
            id: doc._id.toString(),
            firmId: doc.firmId,
            projectId: doc.projectId,
            surveyTitle: doc.surveyTitle,
            aiGeneratedInsight: doc.aiGeneratedInsight,
            confidenceScore: doc.confidenceScore,
            riskSeverity: doc.riskSeverity,
            consultantNotes: doc.consultantNotes,
            signedOffBy: doc.signedOffBy,
            signedOffAt: doc.signedOffAt,
            isVerified: doc.isVerified,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async saveSignoff(entity) {
        const isObjectId = typeof entity.id === 'string' && /^[0-9a-fA-F]{24}$/.test(entity.id);
        let doc = null;
        if (isObjectId) {
            doc = await consultant_models_1.AiSignoffModel.findByIdAndUpdate(entity.id, {
                $set: {
                    consultantNotes: entity.consultantNotes,
                    signedOffBy: entity.signedOffBy,
                    signedOffAt: entity.signedOffAt,
                    isVerified: entity.isVerified,
                    updatedAt: new Date(),
                },
            }, { new: true });
        }
        if (!doc) {
            doc = await consultant_models_1.AiSignoffModel.findOneAndUpdate({ $or: [{ id: entity.id }, { _id: isObjectId ? entity.id : null }] }, {
                $set: {
                    consultantNotes: entity.consultantNotes,
                    signedOffBy: entity.signedOffBy,
                    signedOffAt: entity.signedOffAt,
                    isVerified: entity.isVerified,
                    updatedAt: new Date(),
                },
            }, { new: true });
        }
        // Sync to AiInsightModel if matching insightId
        try {
            const { AiInsightModel } = await Promise.resolve().then(() => __importStar(require('../../../../ai-analytics/infrastructure/persistence/mongoose/ai-insight.schema')));
            await AiInsightModel.updateOne({ $or: [{ insightId: entity.id }, { _id: isObjectId ? entity.id : null }] }, {
                $set: {
                    humanOverride: {
                        overriddenBy: entity.signedOffBy,
                        originalLabel: 'NEGATIVE',
                        newLabel: 'NEUTRAL',
                        reason: entity.consultantNotes,
                        overriddenAt: entity.signedOffAt || new Date(),
                    },
                },
            });
        }
        catch {
            // ignore
        }
        if (!doc) {
            throw new Error(`AI Signoff record ${entity.id} not found`);
        }
        return new consultant_entities_1.AiSignoffEntity({
            id: doc._id.toString(),
            firmId: doc.firmId,
            projectId: doc.projectId,
            surveyTitle: doc.surveyTitle,
            aiGeneratedInsight: doc.aiGeneratedInsight,
            confidenceScore: doc.confidenceScore,
            riskSeverity: doc.riskSeverity,
            consultantNotes: doc.consultantNotes,
            signedOffBy: doc.signedOffBy,
            signedOffAt: doc.signedOffAt,
            isVerified: doc.isVerified,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async seedDefaultsIfEmpty() {
        const [benchmarksCount, engagementsCount, workshopsCount, signoffsCount] = await Promise.all([
            consultant_models_1.IndustryBenchmarkModel.countDocuments(),
            consultant_models_1.ClientEngagementModel.countDocuments(),
            consultant_models_1.ExecutiveWorkshopModel.countDocuments(),
            consultant_models_1.AiSignoffModel.countDocuments(),
        ]);
        // 1. Seed Benchmarks if empty
        if (benchmarksCount === 0) {
            await consultant_models_1.IndustryBenchmarkModel.insertMany([
                // GLOBAL_TECH
                {
                    firmId: 'GLOBAL',
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'GLOBAL_TECH',
                    p25Score: 18.0,
                    p50MedianScore: 38.0,
                    p90TopDecileScore: 64.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'CAREER_GROWTH',
                    metricName: 'Career Progression & Learning Opportunity',
                    sector: 'GLOBAL_TECH',
                    p25Score: 58.0,
                    p50MedianScore: 71.5,
                    p90TopDecileScore: 88.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'LEADERSHIP_TRUST',
                    metricName: 'Strategic Leadership & Executive Transparency',
                    sector: 'GLOBAL_TECH',
                    p25Score: 62.0,
                    p50MedianScore: 74.0,
                    p90TopDecileScore: 91.5,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'SAFETY_COMPLIANCE',
                    metricName: 'Psychological Safety & Operational Well-being',
                    sector: 'GLOBAL_TECH',
                    p25Score: 75.0,
                    p50MedianScore: 84.0,
                    p90TopDecileScore: 96.0,
                },
                // MANUFACTURING_FMCG
                {
                    firmId: 'GLOBAL',
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'MANUFACTURING_FMCG',
                    p25Score: 12.0,
                    p50MedianScore: 32.0,
                    p90TopDecileScore: 58.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'SAFETY_COMPLIANCE',
                    metricName: 'Plant Floor Safety & Physical Protocols',
                    sector: 'MANUFACTURING_FMCG',
                    p25Score: 82.0,
                    p50MedianScore: 90.0,
                    p90TopDecileScore: 98.0,
                },
                // FINANCIAL_SERVICES
                {
                    firmId: 'GLOBAL',
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'FINANCIAL_SERVICES',
                    p25Score: 15.0,
                    p50MedianScore: 35.0,
                    p90TopDecileScore: 60.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'LEADERSHIP_TRUST',
                    metricName: 'Governance Trust & Strategic Communication',
                    sector: 'FINANCIAL_SERVICES',
                    p25Score: 65.0,
                    p50MedianScore: 78.0,
                    p90TopDecileScore: 93.0,
                },
                // TELECOM_TECH
                {
                    firmId: 'GLOBAL',
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'TELECOM_TECH',
                    p25Score: 16.0,
                    p50MedianScore: 36.5,
                    p90TopDecileScore: 62.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'CAREER_GROWTH',
                    metricName: 'DevOps Autonomy & Engineering Progression',
                    sector: 'TELECOM_TECH',
                    p25Score: 55.0,
                    p50MedianScore: 69.0,
                    p90TopDecileScore: 85.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'LEADERSHIP_TRUST',
                    metricName: 'Strategic Leadership & Executive Transparency',
                    sector: 'TELECOM_TECH',
                    p25Score: 60.0,
                    p50MedianScore: 72.5,
                    p90TopDecileScore: 89.0,
                },
                // DIVERSIFIED_CONGLOMERATE
                {
                    firmId: 'GLOBAL',
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'DIVERSIFIED_CONGLOMERATE',
                    p25Score: 14.0,
                    p50MedianScore: 34.0,
                    p90TopDecileScore: 59.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'SAFETY_COMPLIANCE',
                    metricName: 'Operational Safety & Compliance Protocols',
                    sector: 'DIVERSIFIED_CONGLOMERATE',
                    p25Score: 78.0,
                    p50MedianScore: 87.0,
                    p90TopDecileScore: 95.0,
                },
                {
                    firmId: 'GLOBAL',
                    metricKey: 'LEADERSHIP_TRUST',
                    metricName: 'Governance Trust & Strategic Communication',
                    sector: 'DIVERSIFIED_CONGLOMERATE',
                    p25Score: 59.0,
                    p50MedianScore: 71.0,
                    p90TopDecileScore: 88.0,
                },
            ]);
        }
        // 2. Seed Client Engagements if empty
        if (engagementsCount === 0) {
            await consultant_models_1.ClientEngagementModel.insertMany([
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-99201',
                    clientName: 'Talnova Global Enterprise',
                    clientCode: 'TAL',
                    sector: 'GLOBAL_TECH',
                    leadConsultant: 'Dr. Samantha Perera (Daash Global)',
                    stage: 'EXECUTIVE_WORKSHOP',
                    health: 'OPTIMAL',
                    responseRate: 78.4,
                    totalEmployees: 1240,
                    activeSurveys: 4,
                    lastDiagnosticDate: '2026-08-10',
                    nextMilestone: 'C-Suite Strategy Deck Presentation',
                },
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-ASP-2026',
                    clientName: 'Aitken Spence PLC',
                    clientCode: 'ASP',
                    sector: 'MANUFACTURING_FMCG',
                    leadConsultant: 'Dr. Samantha Perera (Daash Global)',
                    stage: 'EXECUTIVE_WORKSHOP',
                    health: 'OPTIMAL',
                    responseRate: 84.2,
                    totalEmployees: 4850,
                    activeSurveys: 2,
                    lastDiagnosticDate: '2026-08-01',
                    nextMilestone: 'Plant Floor Operational Alignment Workshop',
                },
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-NESTLE-2026',
                    clientName: 'Nestlé Lanka',
                    clientCode: 'NES',
                    sector: 'MANUFACTURING_FMCG',
                    leadConsultant: 'Tanya Jayawardena (Daash Global)',
                    stage: 'AI_SYNTHESIS',
                    health: 'ATTENTION',
                    responseRate: 69.1,
                    totalEmployees: 1120,
                    activeSurveys: 1,
                    lastDiagnosticDate: '2026-08-12',
                    nextMilestone: 'Sentiment Divergence Synthesis Review',
                },
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-DIALOG-2026',
                    clientName: 'Dialog Axiata PLC',
                    clientCode: 'DIA',
                    sector: 'GLOBAL_TECH',
                    leadConsultant: 'Michael Vandort (Daash Global)',
                    stage: 'ACTION_SIGNOFF',
                    health: 'OPTIMAL',
                    responseRate: 91.5,
                    totalEmployees: 3200,
                    activeSurveys: 3,
                    lastDiagnosticDate: '2026-07-28',
                    nextMilestone: 'Engineering Progression Band Sign-off',
                },
            ]);
        }
        // 3. Seed Executive Workshops if empty
        if (workshopsCount === 0) {
            await consultant_models_1.ExecutiveWorkshopModel.insertMany([
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-99201',
                    title: 'Executive Strategic Alignment & Culture Workshop',
                    clientName: 'Talnova Global Enterprise',
                    consultantLead: 'Dr. Samantha Perera (Daash Global)',
                    scheduledDate: '2026-09-15',
                    status: 'READY_FOR_EXEC',
                    keyThemes: [
                        'Leadership Transparency & Communication Frequency',
                        'Engineering Career Banding Matrix Gap',
                        'Shift Rotation Fatigue in Production Nodes',
                    ],
                    recommendedInterventions: [
                        'Deploy dual IC/Management technical progression track',
                        'Institute monthly anonymous executive Q&A portal',
                        'Re-evaluate shift change intervals with ergonomics committee',
                    ],
                    actionPlanIds: ['PLAN-ENG-CAREER-BAND', 'PLAN-OPS-COMMUNICATION'],
                },
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-ASP-2026',
                    title: 'Plant Floor Safety Culture & Ergonomics Alignment',
                    clientName: 'Aitken Spence PLC',
                    consultantLead: 'Dr. Samantha Perera (Daash Global)',
                    scheduledDate: '2026-09-22',
                    status: 'READY_FOR_EXEC',
                    keyThemes: [
                        'Near-Miss Reporting Friction',
                        'Machine Operator Safety Protocols',
                    ],
                    recommendedInterventions: [
                        'Implement QR-based 1-click incident reporting',
                        'Supervisor safety mentorship pairing',
                    ],
                    actionPlanIds: [],
                },
            ]);
        }
        // 4. Seed AI Signoffs if empty
        if (signoffsCount === 0) {
            await consultant_models_1.AiSignoffModel.insertMany([
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-99201',
                    surveyTitle: 'Q3 Enterprise Culture & Safety Diagnostic 2026',
                    aiGeneratedInsight: 'Burnout risk identified in Software Engineering due to 78% shift overtime and release sprint crunch mentions in verbatim text.',
                    confidenceScore: 94.2,
                    riskSeverity: 'HIGH',
                    consultantNotes: 'Reviewed with Engineering VP. Agreed to establish sprint buffer days and technical progression roadmap.',
                    signedOffBy: 'Dr. Samantha Perera (Daash Global)',
                    signedOffAt: '2026-08-14T10:30:00.000Z',
                    isVerified: true,
                },
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-99201',
                    surveyTitle: 'Annual Global Engagement Survey 2026',
                    aiGeneratedInsight: 'Plant floor operators express 3.2x higher sentiment negativity regarding break room facilities compared to administrative staff.',
                    confidenceScore: 89.5,
                    riskSeverity: 'MEDIUM',
                    consultantNotes: undefined,
                    signedOffBy: undefined,
                    signedOffAt: undefined,
                    isVerified: false,
                },
                {
                    firmId: 'FIRM-DAASH-01',
                    projectId: 'PRJ-99201',
                    surveyTitle: 'Mid-Year Pulse Diagnostic 2026',
                    aiGeneratedInsight: 'Executive trust index dropped -12% following enterprise reorganization announcement with lack of departmental town halls.',
                    confidenceScore: 96.1,
                    riskSeverity: 'CRITICAL',
                    consultantNotes: undefined,
                    signedOffBy: undefined,
                    signedOffAt: undefined,
                    isVerified: false,
                },
            ]);
        }
    }
}
exports.ConsultantMongoRepository = ConsultantMongoRepository;
//# sourceMappingURL=consultant.repository.js.map