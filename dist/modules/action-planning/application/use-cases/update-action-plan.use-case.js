"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActionPlanUseCase = void 0;
const action_plan_entity_1 = require("../../domain/entities/action-plan.entity");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class UpdateActionPlanUseCase {
    actionPlanRepo;
    constructor(actionPlanRepo) {
        this.actionPlanRepo = actionPlanRepo;
    }
    async execute(projectId, actionPlanId, dto) {
        const existing = await this.actionPlanRepo.findByActionPlanId(projectId, actionPlanId);
        if (!existing) {
            throw new error_middleware_1.AppError(404, `Action plan ${actionPlanId} not found in project ${projectId}`);
        }
        const json = existing.toJSON();
        if (dto.title !== undefined)
            json.title = dto.title;
        if (dto.description !== undefined)
            json.description = dto.description;
        if (dto.assigneeId !== undefined)
            json.assigneeId = dto.assigneeId;
        if (dto.targetScore !== undefined)
            json.targetScore = dto.targetScore;
        if (dto.targetCompletionDate !== undefined)
            json.targetCompletionDate = dto.targetCompletionDate;
        if (dto.milestones !== undefined)
            json.milestones = dto.milestones;
        const updatedEntity = new action_plan_entity_1.ActionPlanEntity(json);
        return await this.actionPlanRepo.save(updatedEntity);
    }
    async toggleMilestone(projectId, actionPlanId, milestoneId, completed) {
        if (this.actionPlanRepo.updateMilestone) {
            const updated = await this.actionPlanRepo.updateMilestone(projectId, actionPlanId, milestoneId, completed);
            if (updated)
                return updated;
        }
        const existing = await this.actionPlanRepo.findByActionPlanId(projectId, actionPlanId);
        if (!existing) {
            throw new error_middleware_1.AppError(404, `Action plan ${actionPlanId} not found in project ${projectId}`);
        }
        let found = false;
        const updatedMilestones = existing.milestones.map((m) => {
            if (m.milestoneId === milestoneId || m.id === milestoneId) {
                found = true;
                return {
                    ...m,
                    status: (completed ? 'COMPLETED' : 'PENDING'),
                    completed,
                };
            }
            return m;
        });
        if (!found) {
            existing.milestones.push({
                milestoneId,
                title: `Milestone ${milestoneId}`,
                status: completed ? 'COMPLETED' : 'PENDING',
                dueDate: new Date(Date.now() + 14 * 86400000),
                completed,
            });
        }
        else {
            existing.milestones = updatedMilestones;
        }
        existing.updatedAt = new Date();
        return await this.actionPlanRepo.save(existing);
    }
}
exports.UpdateActionPlanUseCase = UpdateActionPlanUseCase;
//# sourceMappingURL=update-action-plan.use-case.js.map