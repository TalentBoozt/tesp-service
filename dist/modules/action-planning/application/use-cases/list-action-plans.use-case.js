"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListActionPlansUseCase = void 0;
class ListActionPlansUseCase {
    actionPlanRepo;
    constructor(actionPlanRepo) {
        this.actionPlanRepo = actionPlanRepo;
    }
    async execute(projectId, nodeId, status) {
        return await this.actionPlanRepo.findAllByNode(projectId, nodeId, status);
    }
    async getKanbanBoard(projectId, nodeId) {
        const plans = await this.actionPlanRepo.findAllByNode(projectId, nodeId);
        const kanban = {
            DRAFT: [],
            PROPOSED: [],
            APPROVED: [],
            REJECTED: [],
            IN_PROGRESS: [],
            COMPLETED: [],
            VERIFIED: [],
            CANCELLED: [],
        };
        for (const plan of plans) {
            if (kanban[plan.status]) {
                kanban[plan.status].push(plan);
            }
        }
        return kanban;
    }
}
exports.ListActionPlansUseCase = ListActionPlansUseCase;
//# sourceMappingURL=list-action-plans.use-case.js.map