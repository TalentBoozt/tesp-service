"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantController = void 0;
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
class ConsultantController {
    listEngagementsUseCase;
    getBenchmarksUseCase;
    createWorkshopUseCase;
    listWorkshopsUseCase;
    getSignoffQueueUseCase;
    signoffAiFindingUseCase;
    constructor(listEngagementsUseCase, getBenchmarksUseCase, createWorkshopUseCase, listWorkshopsUseCase, getSignoffQueueUseCase, signoffAiFindingUseCase) {
        this.listEngagementsUseCase = listEngagementsUseCase;
        this.getBenchmarksUseCase = getBenchmarksUseCase;
        this.createWorkshopUseCase = createWorkshopUseCase;
        this.listWorkshopsUseCase = listWorkshopsUseCase;
        this.getSignoffQueueUseCase = getSignoffQueueUseCase;
        this.signoffAiFindingUseCase = signoffAiFindingUseCase;
    }
    getEngagements = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId;
            const engagements = await this.listEngagementsUseCase.execute(projectId);
            res.status(200).json(engagements.map((e) => e.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    getBenchmarks = async (req, res, next) => {
        try {
            const sector = req.query.sector;
            const projectId = req.query.projectId || req.user?.projectId;
            const benchmarks = await this.getBenchmarksUseCase.execute(sector, projectId);
            res.status(200).json(benchmarks.map((b) => b.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    getWorkshops = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId;
            const workshops = await this.listWorkshopsUseCase.execute(projectId);
            res.status(200).json(workshops.map((w) => w.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    createWorkshop = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const consultantLead = req.body.consultantLead ||
                req.user?.name ||
                req.user?.email ||
                req.user?.userId ||
                'Lead Consultant';
            const workshop = await this.createWorkshopUseCase.execute({
                ...req.body,
                consultantLead,
                projectId,
            });
            res.status(201).json(workshop.toJSON());
        }
        catch (err) {
            next(err);
        }
    };
    getWorkspace = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId;
            const consultantName = req.user?.name ||
                req.user?.email ||
                req.user?.userId ||
                'Lead Consultant';
            const [engagements, workshops, queue] = await Promise.all([
                this.listEngagementsUseCase.execute(projectId),
                this.listWorkshopsUseCase.execute(projectId),
                this.getSignoffQueueUseCase.execute(projectId),
            ]);
            res.status(200).json({
                consultantName,
                projectId,
                engagements: engagements.map((e) => e.toJSON()),
                workshops: workshops.map((w) => w.toJSON()),
                signoffQueue: queue.map((q) => q.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
    getSignoffQueue = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId;
            const queue = await this.getSignoffQueueUseCase.execute(projectId);
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