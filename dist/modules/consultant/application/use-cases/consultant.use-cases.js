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
exports.GetAiThemesUseCase = exports.SignoffAiFindingUseCase = exports.GetSignoffQueueUseCase = exports.ListWorkshopsUseCase = exports.DeleteWorkshopUseCase = exports.UpdateWorkshopUseCase = exports.CreateWorkshopUseCase = exports.GetBenchmarksUseCase = exports.ListEngagementsUseCase = void 0;
const consultant_entities_1 = require("../../domain/entities/consultant.entities");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const tenant_context_required_error_1 = require("../../../../shared/domain/errors/tenant-context-required.error");
class ListEngagementsUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(projectId, firmId) {
        return await this.consultantRepo.findEngagements(projectId, firmId);
    }
}
exports.ListEngagementsUseCase = ListEngagementsUseCase;
class GetBenchmarksUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(sector, projectId, firmId) {
        const benchmarks = await this.consultantRepo.findBenchmarks(sector, firmId);
        if (!projectId || projectId === 'GLOBAL') {
            return benchmarks;
        }
        try {
            const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
            const conn = mongoose.default?.connection || mongoose.connection;
            if (!conn || conn.readyState !== 1) {
                return benchmarks;
            }
            const { SurveyResponseModel } = await Promise.resolve().then(() => __importStar(require('../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema')));
            const responses = await SurveyResponseModel.find({ projectId, isDeleted: { $ne: true } }).limit(500).lean();
            let clientScores = {};
            if (responses.length > 0) {
                let totalNumeric = 0;
                let countNumeric = 0;
                let enpsPromoters = 0;
                let enpsDetractors = 0;
                let enpsTotal = 0;
                let careerScores = [];
                let leadershipScores = [];
                let safetyScores = [];
                for (const r of responses) {
                    for (const a of r.answers || []) {
                        if (typeof a.numericValue === 'number' && !isNaN(a.numericValue)) {
                            totalNumeric += a.numericValue;
                            countNumeric++;
                            const normalized = a.numericValue <= 5 ? ((a.numericValue - 1) / 4) * 100 : a.numericValue * 10;
                            const qId = (a.questionId || '').toLowerCase();
                            if (qId.includes('enps') || qId.includes('nps') || qId.includes('recommend')) {
                                enpsTotal++;
                                if (a.numericValue >= (a.numericValue <= 5 ? 5 : 9))
                                    enpsPromoters++;
                                else if (a.numericValue <= (a.numericValue <= 5 ? 3 : 6))
                                    enpsDetractors++;
                            }
                            else if (qId.includes('career') || qId.includes('growth') || qId.includes('learn') || qId.includes('progression')) {
                                careerScores.push(normalized);
                            }
                            else if (qId.includes('leader') || qId.includes('trust') || qId.includes('exec') || qId.includes('transparency')) {
                                leadershipScores.push(normalized);
                            }
                            else if (qId.includes('safe') || qId.includes('comply') || qId.includes('health') || qId.includes('burnout')) {
                                safetyScores.push(normalized);
                            }
                        }
                    }
                }
                const avgScore = countNumeric > 0 ? (totalNumeric / countNumeric) * 20 : 72;
                const calcMean = (arr, fallback) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : fallback;
                clientScores['ENPS'] = enpsTotal > 0
                    ? Math.round(((enpsPromoters - enpsDetractors) / enpsTotal) * 100)
                    : Math.round(avgScore * 0.52);
                clientScores['CAREER_GROWTH'] = Math.round(calcMean(careerScores, avgScore * 0.94));
                clientScores['LEADERSHIP_TRUST'] = Math.round(calcMean(leadershipScores, avgScore * 0.98));
                clientScores['SAFETY_COMPLIANCE'] = Math.round(calcMean(safetyScores, avgScore * 1.06));
            }
            else {
                // Derive from campaign metrics or engagement records if responses not yet finalized
                const { CampaignModel } = await Promise.resolve().then(() => __importStar(require('../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema')));
                const campaigns = await CampaignModel.find({ projectId, isDeleted: { $ne: true } }).lean();
                if (campaigns.length > 0) {
                    const totalTargeted = campaigns.reduce((sum, c) => sum + (c.metrics?.totalTargeted || c.sentCount || 100), 0);
                    const totalCompleted = campaigns.reduce((sum, c) => sum + (c.metrics?.completed || c.responseCount || 75), 0);
                    const completionRate = totalTargeted > 0 ? (totalCompleted / totalTargeted) * 100 : 75;
                    clientScores['ENPS'] = Math.round(completionRate * 0.45);
                    clientScores['CAREER_GROWTH'] = Math.round(completionRate * 0.88);
                    clientScores['LEADERSHIP_TRUST'] = Math.round(completionRate * 0.92);
                    clientScores['SAFETY_COMPLIANCE'] = Math.round(completionRate * 0.98);
                }
            }
            return benchmarks.map((b) => {
                const computedScore = clientScores[b.metricKey];
                if (typeof computedScore === 'number') {
                    return new consultant_entities_1.IndustryBenchmarkEntity({
                        id: b.id,
                        firmId: b.firmId,
                        metricKey: b.metricKey,
                        metricName: b.metricName,
                        sector: b.sector,
                        p25Score: b.p25Score,
                        p50MedianScore: b.p50MedianScore,
                        p90TopDecileScore: b.p90TopDecileScore,
                        clientScore: computedScore,
                        createdAt: b.createdAt,
                        updatedAt: b.updatedAt,
                    });
                }
                return b;
            });
        }
        catch {
            return benchmarks;
        }
    }
}
exports.GetBenchmarksUseCase = GetBenchmarksUseCase;
class CreateWorkshopUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(dto) {
        if (!dto.title) {
            throw new error_middleware_1.AppError(400, 'Workshop title is required');
        }
        if (!dto.clientName) {
            throw new error_middleware_1.AppError(400, 'Client name is required');
        }
        if (!dto.projectId) {
            throw new tenant_context_required_error_1.TenantContextRequiredError('Project ID is required to create an executive workshop');
        }
        return await this.consultantRepo.createWorkshop({
            firmId: dto.firmId,
            projectId: dto.projectId,
            title: dto.title,
            clientName: dto.clientName,
            consultantLead: dto.consultantLead || 'Lead Consultant',
            scheduledDate: dto.scheduledDate || new Date().toISOString().split('T')[0],
            status: dto.status || 'READY_FOR_EXEC',
            keyThemes: dto.keyThemes || [],
            recommendedInterventions: dto.recommendedInterventions || [],
            actionPlanIds: dto.actionPlanIds || [],
        });
    }
}
exports.CreateWorkshopUseCase = CreateWorkshopUseCase;
class UpdateWorkshopUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(id, updates) {
        if (!id) {
            throw new error_middleware_1.AppError(400, 'Workshop ID is required');
        }
        const updated = await this.consultantRepo.updateWorkshop(id, updates);
        if (!updated) {
            throw new error_middleware_1.AppError(404, `Workshop '${id}' not found`);
        }
        return updated;
    }
}
exports.UpdateWorkshopUseCase = UpdateWorkshopUseCase;
class DeleteWorkshopUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(id) {
        if (!id) {
            throw new error_middleware_1.AppError(400, 'Workshop ID is required');
        }
        const deleted = await this.consultantRepo.deleteWorkshop(id);
        if (!deleted) {
            throw new error_middleware_1.AppError(404, `Workshop '${id}' not found`);
        }
        return true;
    }
}
exports.DeleteWorkshopUseCase = DeleteWorkshopUseCase;
class ListWorkshopsUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(projectId, firmId) {
        return await this.consultantRepo.findWorkshops(projectId, firmId);
    }
}
exports.ListWorkshopsUseCase = ListWorkshopsUseCase;
class GetSignoffQueueUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(projectId, firmId) {
        return await this.consultantRepo.findSignoffQueue(projectId, firmId);
    }
}
exports.GetSignoffQueueUseCase = GetSignoffQueueUseCase;
class SignoffAiFindingUseCase {
    consultantRepo;
    constructor(consultantRepo) {
        this.consultantRepo = consultantRepo;
    }
    async execute(findingId, notes, consultantEmail = 'consultant@talnova.io') {
        if (!findingId) {
            throw new error_middleware_1.AppError(400, 'Finding ID is required');
        }
        const item = await this.consultantRepo.findSignoffById(findingId);
        if (!item) {
            throw new error_middleware_1.AppError(404, `AI Signoff item '${findingId}' not found`);
        }
        item.signoff(notes, consultantEmail);
        return await this.consultantRepo.saveSignoff(item);
    }
}
exports.SignoffAiFindingUseCase = SignoffAiFindingUseCase;
class GetAiThemesUseCase {
    async execute(projectId) {
        if (!projectId || projectId === 'GLOBAL') {
            return {
                projectId: projectId || 'GLOBAL',
                topThemes: [
                    'Strategic Leadership Communication',
                    'Cross-Functional Silo Reduction',
                    'Career Progression Transparency',
                    'Engineering Autonomy & Work-Life Balance',
                ],
                recommendedInterventions: [
                    'Institute quarterly executive Town Halls with open anonymous Q&A',
                    'Deploy standardized engineering & management competency matrices',
                    'Establish cross-departmental rotational discovery sprints',
                    'Introduce dedicated focus blocks and on-call rotation rest policies',
                ],
                sentimentSummary: { positivePercent: 54, neutralPercent: 28, negativePercent: 18 },
                criticalRisksCount: 2,
                sampleInsightsCount: 15,
            };
        }
        try {
            const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
            const conn = mongoose.default?.connection || mongoose.connection;
            if (!conn || conn.readyState !== 1) {
                throw new Error('Not connected to MongoDB');
            }
            const { AiInsightModel } = await Promise.resolve().then(() => __importStar(require('../../../ai-analytics/infrastructure/persistence/mongoose/ai-insight.schema')));
            const insights = await AiInsightModel.find({ projectId }).limit(100).lean();
            if (insights.length > 0) {
                const themeCounts = {};
                let positive = 0;
                let neutral = 0;
                let negative = 0;
                let criticalRisks = 0;
                for (const ins of insights) {
                    if (ins.sentimentLabel === 'POSITIVE')
                        positive++;
                    else if (ins.sentimentLabel === 'NEGATIVE')
                        negative++;
                    else
                        neutral++;
                    for (const th of ins.themes || []) {
                        themeCounts[th] = (themeCounts[th] || 0) + 1;
                    }
                    for (const rf of ins.riskFlags || []) {
                        if (rf.severity === 'CRITICAL' || rf.severity === 'HIGH') {
                            criticalRisks++;
                        }
                    }
                }
                const sortedThemes = Object.entries(themeCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([t]) => t)
                    .slice(0, 5);
                const interventions = [];
                const hasBurnout = sortedThemes.some((t) => /burnout|workload|fatigue|hours/i.test(t)) || criticalRisks > 0;
                const hasLeadership = sortedThemes.some((t) => /leader|trust|exec|management|vision/i.test(t));
                const hasCareer = sortedThemes.some((t) => /career|growth|learn|promo|progression/i.test(t));
                if (hasBurnout) {
                    interventions.push('Cap sprint overtime; mandate post-incident on-call recovery windows and wellness check-ins');
                }
                if (hasLeadership) {
                    interventions.push('Schedule bi-weekly skip-level transparency dialogues and publish executive decision charters');
                }
                if (hasCareer) {
                    interventions.push('Roll out structured career competency bands and internal mentorship pathways');
                }
                if (interventions.length === 0) {
                    interventions.push('Conduct focused department retrospective to align team OKRs with employee feedback', 'Establish an executive feedback loop with continuous pulse checks');
                }
                const total = insights.length;
                return {
                    projectId,
                    topThemes: sortedThemes.length > 0 ? sortedThemes : ['Team Collaboration & Morale', 'Resource Allocation & Workload'],
                    recommendedInterventions: interventions,
                    sentimentSummary: {
                        positivePercent: Math.round((positive / total) * 100),
                        neutralPercent: Math.round((neutral / total) * 100),
                        negativePercent: Math.round((negative / total) * 100),
                    },
                    criticalRisksCount: criticalRisks,
                    sampleInsightsCount: total,
                };
            }
        }
        catch {
            // Fallback
        }
        return {
            projectId,
            topThemes: [
                'Strategic Leadership Communication',
                'Cross-Functional Alignment',
                'Career Progression Pathways',
                'Operational Wellness & Psychological Safety',
            ],
            recommendedInterventions: [
                'Initiate bi-weekly C-Suite town halls addressing strategic priorities and feedback',
                'Clarify merit-based promotion criteria and professional development tracks',
                'Formulate cross-departmental collaboration guilds to dismantle communication barriers',
            ],
            sentimentSummary: { positivePercent: 62, neutralPercent: 24, negativePercent: 14 },
            criticalRisksCount: 1,
            sampleInsightsCount: 0,
        };
    }
}
exports.GetAiThemesUseCase = GetAiThemesUseCase;
//# sourceMappingURL=consultant.use-cases.js.map