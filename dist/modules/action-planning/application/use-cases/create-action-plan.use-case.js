"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateActionPlanUseCase = void 0;
const action_plan_entity_1 = require("../../domain/entities/action-plan.entity");
class CreateActionPlanUseCase {
    actionPlanRepo;
    constructor(actionPlanRepo) {
        this.actionPlanRepo = actionPlanRepo;
    }
    async execute(dto) {
        const actionPlanId = `ACT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const rawMilestones = dto.milestones || [];
        const normalizedMilestones = rawMilestones.map((m, index) => ({
            milestoneId: m.milestoneId || m.id || `M-${index + 1}`,
            title: m.title || `Milestone ${index + 1}`,
            status: m.status || (m.completed ? 'COMPLETED' : 'PENDING'),
            dueDate: m.dueDate ? new Date(m.dueDate) : new Date(Date.now() + (index + 1) * 14 * 86400000),
            completed: Boolean(m.completed),
        }));
        const entity = new action_plan_entity_1.ActionPlanEntity({
            projectId: dto.projectId,
            actionPlanId,
            campaignId: dto.campaignId,
            nodeId: dto.nodeId,
            groupId: dto.groupId,
            title: dto.title,
            description: dto.description,
            assigneeId: dto.assigneeId,
            baselineScore: dto.baselineScore,
            targetScore: dto.targetScore,
            targetCompletionDate: dto.targetCompletionDate,
            milestones: normalizedMilestones,
            status: 'DRAFT',
        });
        return await this.actionPlanRepo.save(entity);
    }
}
exports.CreateActionPlanUseCase = CreateActionPlanUseCase;
//# sourceMappingURL=create-action-plan.use-case.js.map