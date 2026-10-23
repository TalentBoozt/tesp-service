"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActionPlanUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetActionPlanUseCase {
    actionPlanRepo;
    constructor(actionPlanRepo) {
        this.actionPlanRepo = actionPlanRepo;
    }
    async execute(projectId, actionPlanId) {
        const plan = await this.actionPlanRepo.findByActionPlanId(projectId, actionPlanId);
        if (!plan) {
            throw new error_middleware_1.AppError(404, `Action plan ${actionPlanId} not found in project ${projectId}`);
        }
        return plan;
    }
}
exports.GetActionPlanUseCase = GetActionPlanUseCase;
//# sourceMappingURL=get-action-plan.use-case.js.map