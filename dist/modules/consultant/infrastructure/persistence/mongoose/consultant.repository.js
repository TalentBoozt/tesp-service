"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantMongoRepository = void 0;
const consultant_entities_1 = require("../../../domain/entities/consultant.entities");
const consultant_models_1 = require("./consultant.models");
class ConsultantMongoRepository {
    async findEngagements(projectId) {
        if (!projectId || projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
            return []; // Strict tenant isolation: do not permit unconstrained queries
        }
        const query = { projectId };
        const docs = await consultant_models_1.ClientEngagementModel.find(query).sort({ updatedAt: -1 });
        return docs.map((d) => new consultant_entities_1.ClientEngagementEntity({
            id: d._id ? d._id.toString() : d.id,
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
    async findBenchmarks(sector) {
        const query = sector && sector !== 'ALL' ? { sector } : {};
        const docs = await consultant_models_1.IndustryBenchmarkModel.find(query);
        return docs.map((d) => new consultant_entities_1.IndustryBenchmarkEntity({
            id: d._id ? d._id.toString() : d.id,
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
    async findWorkshops(projectId) {
        if (!projectId || projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
            return []; // Strict tenant isolation
        }
        const query = { projectId };
        const docs = await consultant_models_1.ExecutiveWorkshopModel.find(query).sort({ scheduledDate: -1 });
        return docs.map((d) => new consultant_entities_1.ExecutiveWorkshopEntity({
            id: d._id ? d._id.toString() : d.id,
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
    async findSignoffQueue(projectId) {
        if (!projectId || projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
            return []; // Strict tenant isolation
        }
        const query = { projectId };
        const docs = await consultant_models_1.AiSignoffModel.find(query).sort({ createdAt: -1 });
        return docs.map((d) => new consultant_entities_1.AiSignoffEntity({
            id: d._id ? d._id.toString() : d.id,
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
        const doc = await consultant_models_1.AiSignoffModel.findById(id).catch(() => null);
        if (!doc) {
            // Try finding by custom id or search
            const fallback = await consultant_models_1.AiSignoffModel.findOne({
                $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { id }],
            });
            if (!fallback)
                return null;
            return new consultant_entities_1.AiSignoffEntity({
                id: fallback._id.toString(),
                projectId: fallback.projectId,
                surveyTitle: fallback.surveyTitle,
                aiGeneratedInsight: fallback.aiGeneratedInsight,
                confidenceScore: fallback.confidenceScore,
                riskSeverity: fallback.riskSeverity,
                consultantNotes: fallback.consultantNotes,
                signedOffBy: fallback.signedOffBy,
                signedOffAt: fallback.signedOffAt,
                isVerified: fallback.isVerified,
                createdAt: fallback.createdAt,
                updatedAt: fallback.updatedAt,
            });
        }
        return new consultant_entities_1.AiSignoffEntity({
            id: doc._id.toString(),
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
        const doc = await consultant_models_1.AiSignoffModel.findByIdAndUpdate(entity.id, {
            $set: {
                consultantNotes: entity.consultantNotes,
                signedOffBy: entity.signedOffBy,
                signedOffAt: entity.signedOffAt,
                isVerified: entity.isVerified,
                updatedAt: new Date(),
            },
        }, { new: true });
        if (!doc) {
            throw new Error(`AI Signoff record ${entity.id} not found`);
        }
        return new consultant_entities_1.AiSignoffEntity({
            id: doc._id.toString(),
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
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'GLOBAL_TECH',
                    p25Score: 18.0,
                    p50MedianScore: 38.0,
                    p90TopDecileScore: 64.0,
                },
                {
                    metricKey: 'CAREER_GROWTH',
                    metricName: 'Career Progression & Learning Opportunity',
                    sector: 'GLOBAL_TECH',
                    p25Score: 58.0,
                    p50MedianScore: 71.5,
                    p90TopDecileScore: 88.0,
                },
                {
                    metricKey: 'LEADERSHIP_TRUST',
                    metricName: 'Strategic Leadership & Executive Transparency',
                    sector: 'GLOBAL_TECH',
                    p25Score: 62.0,
                    p50MedianScore: 74.0,
                    p90TopDecileScore: 91.5,
                },
                {
                    metricKey: 'SAFETY_COMPLIANCE',
                    metricName: 'Psychological Safety & Operational Well-being',
                    sector: 'GLOBAL_TECH',
                    p25Score: 75.0,
                    p50MedianScore: 84.0,
                    p90TopDecileScore: 96.0,
                },
                // MANUFACTURING_FMCG
                {
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'MANUFACTURING_FMCG',
                    p25Score: 12.0,
                    p50MedianScore: 32.0,
                    p90TopDecileScore: 58.0,
                },
                {
                    metricKey: 'SAFETY_COMPLIANCE',
                    metricName: 'Plant Floor Safety & Physical Protocols',
                    sector: 'MANUFACTURING_FMCG',
                    p25Score: 82.0,
                    p50MedianScore: 90.0,
                    p90TopDecileScore: 98.0,
                },
                // FINANCIAL_SERVICES
                {
                    metricKey: 'ENPS',
                    metricName: 'Employee Net Promoter Score (eNPS)',
                    sector: 'FINANCIAL_SERVICES',
                    p25Score: 15.0,
                    p50MedianScore: 35.0,
                    p90TopDecileScore: 60.0,
                },
                {
                    metricKey: 'LEADERSHIP_TRUST',
                    metricName: 'Governance Trust & Strategic Communication',
                    sector: 'FINANCIAL_SERVICES',
                    p25Score: 65.0,
                    p50MedianScore: 78.0,
                    p90TopDecileScore: 93.0,
                },
            ]);
        }
        // 2. Seed Client Engagements if empty
        if (engagementsCount === 0) {
            await consultant_models_1.ClientEngagementModel.insertMany([
                {
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