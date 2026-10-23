"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantController = void 0;
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
            const projectId = req.query.projectId;
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
            const projectId = req.query.projectId;
            const benchmarks = await this.getBenchmarksUseCase.execute(sector, projectId);
            res.status(200).json(benchmarks.map((b) => b.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    getWorkshops = async (req, res, next) => {
        try {
            const projectId = req.query.projectId;
            const workshops = await this.listWorkshopsUseCase.execute(projectId);
            res.status(200).json(workshops.map((w) => w.toJSON()));
        }
        catch (err) {
            next(err);
        }
    };
    createWorkshop = async (req, res, next) => {
        try {
            const projectId = req.body.projectId || req.user?.projectId || 'PRJ-99201';
            const workshop = await this.createWorkshopUseCase.execute({
                ...req.body,
                projectId,
            });
            res.status(201).json(workshop.toJSON());
        }
        catch (err) {
            next(err);
        }
    };
    getSignoffQueue = async (req, res, next) => {
        try {
            const projectId = req.query.projectId;
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
            const consultantEmail = req.user?.userId || 'Dr. Samantha Perera (Daash Global)';
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