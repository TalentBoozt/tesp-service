"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteActionPlanUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class DeleteActionPlanUseCase {
    actionPlanRepo;
    constructor(actionPlanRepo) {
        this.actionPlanRepo = actionPlanRepo;
    }
    async execute(projectId, actionPlanId) {
        const existing = await this.actionPlanRepo.findByActionPlanId(projectId, actionPlanId);
        if (!existing) {
            throw new error_middleware_1.AppError(404, `Action plan ${actionPlanId} not found in project ${projectId}`);
        }
        const success = await this.actionPlanRepo.delete(projectId, actionPlanId);
        if (!success) {
            throw new error_middleware_1.AppError(500, `Failed to delete action plan ${actionPlanId}`);
        }
    }
}
exports.DeleteActionPlanUseCase = DeleteActionPlanUseCase;
//# sourceMappingURL=delete-action-plan.use-case.js.map