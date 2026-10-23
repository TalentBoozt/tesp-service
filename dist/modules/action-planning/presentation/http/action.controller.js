"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionController = void 0;
const action_plan_dto_1 = require("../../application/dto/action-plan.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class ActionController {
    createActionPlanUseCase;
    transitionActionPlanStatusUseCase;
    getRecommendedTemplatesUseCase;
    syncExternalTaskUseCase;
    listActionPlansUseCase;
    getActionPlanUseCase;
    updateActionPlanUseCase;
    deleteActionPlanUseCase;
    constructor(createActionPlanUseCase, transitionActionPlanStatusUseCase, getRecommendedTemplatesUseCase, syncExternalTaskUseCase, listActionPlansUseCase, getActionPlanUseCase, updateActionPlanUseCase, deleteActionPlanUseCase) {
        this.createActionPlanUseCase = createActionPlanUseCase;
        this.transitionActionPlanStatusUseCase = transitionActionPlanStatusUseCase;
        this.getRecommendedTemplatesUseCase = getRecommendedTemplatesUseCase;
        this.syncExternalTaskUseCase = syncExternalTaskUseCase;
        this.listActionPlansUseCase = listActionPlansUseCase;
        this.getActionPlanUseCase = getActionPlanUseCase;
        this.updateActionPlanUseCase = updateActionPlanUseCase;
        this.deleteActionPlanUseCase = deleteActionPlanUseCase;
    }
    createActionPlan = async (req, res, next) => {
        try {
            const body = { ...req.body };
            if (!body.projectId)
                body.projectId = req.user?.projectId || 'PRJ-99201';
            if (!body.campaignId)
                body.campaignId = 'CMP-1001';
            if (!body.nodeId)
                body.nodeId = body.orgNodeCode || (body.projectId === 'PRJ-APAC01' ? 'N-5G-NETWORKS' : body.projectId === 'PRJ-NESTLE' ? 'N-PANNALA-FACTORY' : 'N-HOTELS-DIV');
            if (!body.groupId)
                body.groupId = 'PSYCHOLOGICAL_SAFETY';
            if (!body.assigneeId)
                body.assigneeId = body.ownerEmail || req.user?.userId || (body.projectId === 'PRJ-APAC01' ? 'EMP-DIA-101' : body.projectId === 'PRJ-NESTLE' ? 'EMP-NES-101' : 'EMP-ASP-101');
            if (body.baselineScore === undefined)
                body.baselineScore = body.currentScore ?? 65;
            if (body.targetScore === undefined)
                body.targetScore = 85;
            if (!body.targetCompletionDate) {
                body.targetCompletionDate = body.dueDate || new Date(Date.now() + 60 * 86400000).toISOString();
            }
            if (Array.isArray(body.milestones)) {
                body.milestones = body.milestones.map((m, idx) => ({
                    milestoneId: m.milestoneId || m.id || `M-${idx + 1}`,
                    title: m.title || `Milestone ${idx + 1}`,
                    dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : new Date(Date.now() + (idx + 1) * 14 * 86400000).toISOString(),
                }));
            }
            const parsed = action_plan_dto_1.CreateActionPlanDtoSchema.safeParse(body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail);
            }
            const plan = await this.createActionPlanUseCase.execute(parsed.data);
            res.status(201).json({
                message: 'Action plan created successfully',
                actionPlan: plan.toJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    };
    getActionPlan = async (req, res, next) => {
        try {
            const { actionPlanId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!this.getActionPlanUseCase) {
                throw new error_middleware_1.AppError(500, 'GetActionPlanUseCase not configured');
            }
            const plan = await this.getActionPlanUseCase.execute(projectId, actionPlanId);
            res.status(200).json({ actionPlan: plan.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    updateActionPlan = async (req, res, next) => {
        try {
            const { actionPlanId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!this.updateActionPlanUseCase) {
                throw new error_middleware_1.AppError(500, 'UpdateActionPlanUseCase not configured');
            }
            // Delegate milestone toggle if milestoneId is provided
            if (req.body.milestoneId) {
                const completed = req.body.completed !== undefined ? Boolean(req.body.completed) : true;
                const updated = await this.updateActionPlanUseCase.toggleMilestone(projectId, actionPlanId, req.body.milestoneId, completed);
                res.status(200).json({
                    message: 'Milestone updated successfully',
                    actionPlan: updated.toJSON(),
                });
                return;
            }
            const parsed = action_plan_dto_1.UpdateActionPlanDtoSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail);
            }
            const updated = await this.updateActionPlanUseCase.execute(projectId, actionPlanId, parsed.data);
            res.status(200).json({
                message: 'Action plan updated successfully',
                actionPlan: updated.toJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    };
    toggleMilestone = async (req, res, next) => {
        try {
            const { actionPlanId, milestoneId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const completed = req.body.completed !== undefined ? Boolean(req.body.completed) : true;
            if (!this.updateActionPlanUseCase) {
                throw new error_middleware_1.AppError(500, 'UpdateActionPlanUseCase not configured');
            }
            const updated = await this.updateActionPlanUseCase.toggleMilestone(projectId, actionPlanId, milestoneId, completed);
            res.status(200).json({
                message: 'Milestone updated successfully',
                actionPlan: updated.toJSON(),
            });
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message));
                return;
            }
            next(err);
        }
    };
    deleteActionPlan = async (req, res, next) => {
        try {
            const { actionPlanId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!this.deleteActionPlanUseCase) {
                throw new error_middleware_1.AppError(500, 'DeleteActionPlanUseCase not configured');
            }
            await this.deleteActionPlanUseCase.execute(projectId, actionPlanId);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
    transitionStatus = async (req, res, next) => {
        try {
            const { actionPlanId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const targetStatus = req.body.targetStatus || req.body.toStatus;
            const parsed = action_plan_dto_1.TransitionStatusDtoSchema.safeParse({ ...req.body, targetStatus });
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail);
            }
            const actorId = req.user?.userId || 'USR-ADMIN';
            const userRole = req.user?.role || auth_middleware_1.UserRole.SUPER_ADMIN;
            const updated = await this.transitionActionPlanStatusUseCase.execute(projectId, actionPlanId, parsed.data.targetStatus, actorId, userRole, parsed.data.postActionScore);
            res.status(200).json({
                message: `Action plan status transitioned to ${parsed.data.targetStatus}`,
                actionPlan: updated.toJSON(),
            });
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message));
                return;
            }
            if (err.message && (err.message.includes('Invalid state transition') || err.message.includes('postActionScore'))) {
                next(new error_middleware_1.AppError(400, err.message));
                return;
            }
            next(err);
        }
    };
    getTemplates = async (req, res, next) => {
        try {
            const groupId = req.query.groupId;
            const score = req.query.score ? parseFloat(req.query.score) : undefined;
            const surveyId = req.query.surveyId || req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-99201';
            const templates = await this.getRecommendedTemplatesUseCase.execute(groupId, score, surveyId, projectId);
            res.status(200).json({
                total: templates.length,
                templates: templates.map((t) => t.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
    syncTask = async (req, res, next) => {
        try {
            const { actionPlanId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const system = req.body.system || 'JIRA';
            const updated = await this.syncExternalTaskUseCase.execute(projectId, actionPlanId, system);
            const key = updated.externalSync.externalKey ||
                updated.externalSync.externalTaskId ||
                `JIRA-${Math.floor(1000 + Math.random() * 9000)}`;
            res.status(200).json({
                message: `Action plan synced to ${system} successfully`,
                actionPlan: updated.toJSON(),
                externalTaskId: key,
                externalUrl: system === 'JIRA'
                    ? `https://jira.talnova.io/browse/${key}`
                    : `https://tasks.office.com/talnova.io/plans/${key}`,
            });
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message));
                return;
            }
            next(err);
        }
    };
    getKanban = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const nodeId = req.query.nodeId;
            const kanban = await this.listActionPlansUseCase.getKanbanBoard(projectId, nodeId);
            const allPlans = Object.values(kanban).flat();
            const serializedColumns = {
                DRAFT: (kanban.DRAFT || []).map((p) => p.toJSON()),
                PROPOSED: (kanban.PROPOSED || []).map((p) => p.toJSON()),
                APPROVED: (kanban.APPROVED || []).map((p) => p.toJSON()),
                REJECTED: (kanban.REJECTED || []).map((p) => p.toJSON()),
                IN_PROGRESS: (kanban.IN_PROGRESS || []).map((p) => p.toJSON()),
                COMPLETED: (kanban.COMPLETED || []).map((p) => p.toJSON()),
                VERIFIED: (kanban.VERIFIED || []).map((p) => p.toJSON()),
                CANCELLED: (kanban.CANCELLED || []).map((p) => p.toJSON()),
            };
            res.status(200).json({
                columns: serializedColumns,
                ...serializedColumns,
                plans: allPlans.map((p) => p.toJSON()),
                total: allPlans.length,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ActionController = ActionController;
//# sourceMappingURL=action.controller.js.map