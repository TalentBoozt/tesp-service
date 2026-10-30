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
exports.ConsultantController = void 0;
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
const consultant_use_cases_1 = require("../../application/use-cases/consultant.use-cases");
const consultant_entities_1 = require("../../domain/entities/consultant.entities");
const mongo_consulting_firm_repository_1 = require("../../infrastructure/persistence/mongoose/mongo-consulting-firm.repository");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const notification_service_1 = require("../../../notification/infrastructure/services/notification.service");
class ConsultantController {
    listEngagementsUseCase;
    getBenchmarksUseCase;
    createWorkshopUseCase;
    listWorkshopsUseCase;
    getSignoffQueueUseCase;
    signoffAiFindingUseCase;
    updateWorkshopUseCase;
    deleteWorkshopUseCase;
    getAiThemesUseCase;
    firmRepo;
    constructor(listEngagementsUseCase, getBenchmarksUseCase, createWorkshopUseCase, listWorkshopsUseCase, getSignoffQueueUseCase, signoffAiFindingUseCase, updateWorkshopUseCase = new consultant_use_cases_1.UpdateWorkshopUseCase(null), deleteWorkshopUseCase = new consultant_use_cases_1.DeleteWorkshopUseCase(null), getAiThemesUseCase = new consultant_use_cases_1.GetAiThemesUseCase(), firmRepo = new mongo_consulting_firm_repository_1.MongoConsultingFirmRepository()) {
        this.listEngagementsUseCase = listEngagementsUseCase;
        this.getBenchmarksUseCase = getBenchmarksUseCase;
        this.createWorkshopUseCase = createWorkshopUseCase;
        this.listWorkshopsUseCase = listWorkshopsUseCase;
        this.getSignoffQueueUseCase = getSignoffQueueUseCase;
        this.signoffAiFindingUseCase = signoffAiFindingUseCase;
        this.updateWorkshopUseCase = updateWorkshopUseCase;
        this.deleteWorkshopUseCase = deleteWorkshopUseCase;
        this.getAiThemesUseCase = getAiThemesUseCase;
        this.firmRepo = firmRepo;
    }
    async resolveFirmContext(req) {
        const isSuperAdmin = req.user?.role === auth_middleware_1.UserRole.SUPER_ADMIN;
        if (isSuperAdmin) {
            const availableFirms = await this.firmRepo.findAll();
            const requestedFirmId = req.query.firmId;
            if (requestedFirmId && requestedFirmId !== 'ALL') {
                const firm = await this.firmRepo.findByFirmId(requestedFirmId);
                return {
                    firmId: firm?.firmId || requestedFirmId,
                    firm,
                    isSuperAdmin: true,
                    availableFirms,
                };
            }
            if (requestedFirmId === 'ALL') {
                return {
                    firmId: 'ALL',
                    firm: null,
                    isSuperAdmin: true,
                    availableFirms,
                };
            }
            // Default Super Admin to first available firm if exists
            const defaultFirm = availableFirms[0] || null;
            return {
                firmId: defaultFirm?.firmId,
                firm: defaultFirm,
                isSuperAdmin: true,
                availableFirms,
            };
        }
        // Strict single consultant firm isolation
        let firm = req.user?.firmId ? await this.firmRepo.findByFirmId(req.user.firmId) : null;
        if (!firm && req.user?.userId) {
            firm = await this.firmRepo.findByConsultantUserId(req.user.userId);
        }
        return {
            firmId: firm?.firmId || req.user?.firmId,
            firm,
            isSuperAdmin: false,
        };
    }
    async enrichEngagementMetrics(engagements) {
        if (!engagements || engagements.length === 0)
            return engagements;
        try {
            const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
            const conn = mongoose.default?.connection || mongoose.connection;
            if (!conn || conn.readyState !== 1) {
                return engagements;
            }
            const { EmployeeModel } = await Promise.resolve().then(() => __importStar(require('../../../employee/infrastructure/persistence/mongoose/employee.schema')));
            const { CampaignModel } = await Promise.resolve().then(() => __importStar(require('../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema')));
            const { SurveyResponseModel } = await Promise.resolve().then(() => __importStar(require('../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema')));
            const enriched = [];
            for (const e of engagements) {
                if (!e.projectId || e.projectId === 'PRJ-DEFAULT' || e.projectId === 'GLOBAL') {
                    enriched.push(e);
                    continue;
                }
                try {
                    const [empCount, activeCampaigns, totalResponses, campaigns] = await Promise.all([
                        EmployeeModel.countDocuments({ projectId: e.projectId, isDeleted: { $ne: true } }),
                        CampaignModel.countDocuments({ projectId: e.projectId, isDeleted: { $ne: true }, status: 'ACTIVE' }),
                        SurveyResponseModel.countDocuments({ projectId: e.projectId, isDeleted: { $ne: true } }),
                        CampaignModel.find({ projectId: e.projectId, isDeleted: { $ne: true } }).lean(),
                    ]);
                    const totalTargeted = campaigns.reduce((sum, c) => sum + (c.metrics?.totalTargeted || c.sentCount || 0), 0);
                    const completedFromCampaigns = campaigns.reduce((sum, c) => sum + (c.metrics?.completed || 0), 0);
                    const effectiveResponses = Math.max(totalResponses, completedFromCampaigns);
                    const liveResponseRate = totalTargeted > 0
                        ? Math.round((effectiveResponses / totalTargeted) * 1000) / 10
                        : (empCount > 0 && effectiveResponses > 0 ? Math.min(100, Math.round((effectiveResponses / empCount) * 1000) / 10) : e.responseRate);
                    const liveEmployees = empCount > 0 ? empCount : e.totalEmployees;
                    const liveActiveSurveys = activeCampaigns > 0 ? activeCampaigns : e.activeSurveys;
                    let health = e.health;
                    if (liveResponseRate >= 70)
                        health = 'OPTIMAL';
                    else if (liveResponseRate >= 45)
                        health = 'ATTENTION';
                    else if (totalTargeted > 0)
                        health = 'CRITICAL';
                    let stage = e.stage;
                    if (effectiveResponses > 50)
                        stage = 'EXECUTIVE_WORKSHOP';
                    else if (effectiveResponses > 0)
                        stage = 'AI_SYNTHESIS';
                    else if (liveActiveSurveys > 0)
                        stage = 'FIELDWORK';
                    enriched.push(new consultant_entities_1.ClientEngagementEntity({
                        ...e.toJSON(),
                        totalEmployees: liveEmployees,
                        activeSurveys: liveActiveSurveys,
                        responseRate: liveResponseRate,
                        health,
                        stage,
                    }));
                }
                catch {
                    enriched.push(e);
                }
            }
            return enriched;
        }
        catch {
            return engagements;
        }
    }
    getEngagements = async (req, res, next) => {
        try {
            const { firmId, isSuperAdmin } = await this.resolveFirmContext(req);
            let projectId = req.query.projectId;
            if (projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
                projectId = undefined;
            }
            if (!isSuperAdmin && projectId && req.user?.authorizedProjectIds?.length) {
                if (!req.user.authorizedProjectIds.includes(projectId) && req.user.projectId !== projectId) {
                    projectId = req.user.authorizedProjectIds[0] || req.user.projectId;
                }
            }
            let engagements = await this.listEngagementsUseCase.execute(projectId, firmId);
            engagements = await this.enrichEngagementMetrics(engagements);
            res.status(200).json(engagements.map((e) => e.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    getBenchmarks = async (req, res, next) => {
        try {
            const { firmId } = await this.resolveFirmContext(req);
            const sector = req.query.sector;
            let projectId = req.query.projectId || req.user?.projectId;
            if (projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
                projectId = undefined;
            }
            const benchmarks = await this.getBenchmarksUseCase.execute(sector, projectId, firmId);
            res.status(200).json(benchmarks.map((b) => b.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    getWorkshops = async (req, res, next) => {
        try {
            const { firmId } = await this.resolveFirmContext(req);
            let projectId = req.query.projectId || req.user?.projectId;
            if (projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
                projectId = undefined;
            }
            const workshops = await this.listWorkshopsUseCase.execute(projectId, firmId);
            res.status(200).json(workshops.map((w) => w.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    createWorkshop = async (req, res, next) => {
        try {
            const { firmId } = await this.resolveFirmContext(req);
            const projectId = req.body.projectId || req.headers['x-project-id'] || (0, tenant_context_1.resolveTenantProjectId)(req);
            const consultantLead = req.body.consultantLead ||
                req.user?.name ||
                req.user?.email ||
                req.user?.userId ||
                'Lead Consultant';
            const workshop = await this.createWorkshopUseCase.execute({
                ...req.body,
                firmId: firmId || req.body.firmId,
                consultantLead,
                projectId,
            });
            notification_service_1.notificationService
                .notifyExecutiveWorkshopCreated(projectId, workshop.title, consultantLead)
                .catch((e) => console.warn('[ConsultantController] Workshop notification warning:', e));
            res.status(201).json(workshop.toJSON());
        }
        catch (err) {
            next(err);
        }
    };
    getWorkspace = async (req, res, next) => {
        try {
            const { firmId, firm, isSuperAdmin, availableFirms } = await this.resolveFirmContext(req);
            const consultantName = req.user?.name ||
                req.user?.email ||
                req.user?.userId ||
                'Lead Consultant';
            let projectId = req.query.projectId;
            if (projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
                projectId = undefined;
            }
            if (!isSuperAdmin && projectId && req.user?.authorizedProjectIds?.length) {
                if (!req.user.authorizedProjectIds.includes(projectId) && req.user.projectId !== projectId) {
                    projectId = req.user.authorizedProjectIds[0] || req.user.projectId;
                }
            }
            // Engagements list must provide the complete portfolio for the firm (not filtered to single project)
            let engagements = await this.listEngagementsUseCase.execute(undefined, firmId);
            // If engagements empty, synthesize from ProjectModel
            if (engagements.length === 0) {
                try {
                    const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
                    const conn = mongoose.default?.connection || mongoose.connection;
                    if (conn && conn.readyState === 1) {
                        const { ProjectModel } = await Promise.resolve().then(() => __importStar(require('../../../project-config/infrastructure/persistence/mongoose/project.schema')));
                        const projectQuery = { isDeleted: { $ne: true } };
                        if (!isSuperAdmin || (firmId && firmId !== 'ALL')) {
                            projectQuery.$or = [
                                { consultantFirmId: firmId },
                                { projectId: { $in: firm?.assignedProjectIds || [] } },
                            ];
                        }
                        const matchedProjects = await ProjectModel.find(projectQuery).lean();
                        if (matchedProjects.length > 0) {
                            engagements = matchedProjects.map((p) => new consultant_entities_1.ClientEngagementEntity({
                                id: `eng-proj-${p.projectId}`,
                                firmId: firmId || p.consultantFirmId || 'FIRM-GLOBAL',
                                projectId: p.projectId,
                                clientName: p.name || p.clientOrgName || p.projectId,
                                clientCode: p.projectId.slice(0, 4).toUpperCase(),
                                sector: 'GLOBAL_TECH',
                                leadConsultant: consultantName,
                                stage: 'EXECUTIVE_WORKSHOP',
                                health: 'OPTIMAL',
                                responseRate: 88.0,
                                totalEmployees: p.budgets?.maxEmployees || 500,
                                activeSurveys: 1,
                                lastDiagnosticDate: new Date().toISOString().split('T')[0],
                                nextMilestone: 'Quarterly Executive Review',
                            }));
                        }
                    }
                }
                catch {
                    // ignore error if model not available
                }
            }
            engagements = await this.enrichEngagementMetrics(engagements);
            const activeProjectId = (projectId && projectId !== 'PRJ-DEFAULT' && projectId !== 'GLOBAL')
                ? projectId
                : (engagements.length > 0 ? engagements[0].projectId : req.user?.projectId);
            const targetProj = (activeProjectId && activeProjectId !== 'PRJ-DEFAULT' && activeProjectId !== 'GLOBAL')
                ? activeProjectId
                : undefined;
            const [workshops, queue, benchmarks] = await Promise.all([
                this.listWorkshopsUseCase.execute(targetProj, firmId),
                this.getSignoffQueueUseCase.execute(targetProj, firmId),
                this.getBenchmarksUseCase.execute(undefined, targetProj, firmId),
            ]);
            res.status(200).json({
                consultantName,
                projectId: activeProjectId,
                firmId: firmId || firm?.firmId,
                firmName: firmId === 'ALL'
                    ? 'All Consulting Firms'
                    : firm?.name || req.user?.firmName || 'Advisory Partner',
                firmLogo: firm?.slug ? `https://tesp.talnova.io/assets/firms/${firm.slug}.svg` : undefined,
                tier: firm?.tier || 'ENTERPRISE',
                isSuperAdmin,
                availableFirms: isSuperAdmin
                    ? (availableFirms || []).map((f) => ({
                        firmId: f.firmId,
                        name: f.name,
                        slug: f.slug,
                        tier: f.tier,
                        assignedProjectIds: f.assignedProjectIds,
                    }))
                    : undefined,
                methodologyNote: 'Benchmarks are calculated using normalized multi-organization diagnostics across audited industry data. Percentile rankings update quarterly based on verified response sets.',
                engagements: engagements.map((e) => e.toJSON()),
                benchmarks: benchmarks.map((b) => b.toJSON()),
                workshops: workshops.map((w) => w.toJSON()),
                signoffQueue: queue.map((q) => q.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateWorkshop = async (req, res, next) => {
        try {
            const workshopId = req.params.id;
            const updated = await this.updateWorkshopUseCase.execute(workshopId, req.body);
            res.status(200).json(updated.toJSON());
        }
        catch (err) {
            next(err);
        }
    };
    deleteWorkshop = async (req, res, next) => {
        try {
            const workshopId = req.params.id;
            await this.deleteWorkshopUseCase.execute(workshopId);
            res.status(200).json({ success: true, message: 'Executive workshop deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    };
    getAiThemes = async (req, res, next) => {
        try {
            let projectId = req.query.projectId || req.user?.projectId;
            if (projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
                projectId = undefined;
            }
            const synthesis = await this.getAiThemesUseCase.execute(projectId || 'GLOBAL');
            res.status(200).json(synthesis);
        }
        catch (err) {
            next(err);
        }
    };
    getSignoffQueue = async (req, res, next) => {
        try {
            const { firmId } = await this.resolveFirmContext(req);
            let projectId = req.query.projectId || req.user?.projectId;
            if (projectId === 'PRJ-DEFAULT' || projectId === 'GLOBAL') {
                projectId = undefined;
            }
            const queue = await this.getSignoffQueueUseCase.execute(projectId, firmId);
            res.status(200).json(queue.map((q) => q.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    signoffAiFinding = async (req, res, next) => {
        try {
            const findingId = req.params.id;
            const notes = req.body.notes || '';
            const consultantEmail = req.user?.name ||
                req.user?.email ||
                req.user?.userId ||
                'Lead Consultant';
            const updated = await this.signoffAiFindingUseCase.execute(findingId, notes, consultantEmail);
            res.status(200).json(updated.toJSON());
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ConsultantController = ConsultantController;
//# sourceMappingURL=consultant.controller.js.map