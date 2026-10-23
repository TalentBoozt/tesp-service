"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActionPlanningRouter = createActionPlanningRouter;
const express_1 = require("express");
const action_plan_repository_1 = require("../../infrastructure/persistence/mongoose/action-plan.repository");
const action_template_repository_1 = require("../../infrastructure/persistence/mongoose/action-template.repository");
const create_action_plan_use_case_1 = require("../../application/use-cases/create-action-plan.use-case");
const transition_action_plan_status_use_case_1 = require("../../application/use-cases/transition-action-plan-status.use-case");
const get_recommended_templates_use_case_1 = require("../../application/use-cases/get-recommended-templates.use-case");
const sync_external_task_use_case_1 = require("../../application/use-cases/sync-external-task.use-case");
const list_action_plans_use_case_1 = require("../../application/use-cases/list-action-plans.use-case");
const get_action_plan_use_case_1 = require("../../application/use-cases/get-action-plan.use-case");
const update_action_plan_use_case_1 = require("../../application/use-cases/update-action-plan.use-case");
const delete_action_plan_use_case_1 = require("../../application/use-cases/delete-action-plan.use-case");
const action_controller_1 = require("./action.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createActionPlanningRouter(actionPlanRepo, templateRepo) {
    const router = (0, express_1.Router)();
    const planRepo = actionPlanRepo || new action_plan_repository_1.ActionPlanMongoRepository();
    const tplRepo = templateRepo || new action_template_repository_1.ActionTemplateMongoRepository();
    const createActionPlanUseCase = new create_action_plan_use_case_1.CreateActionPlanUseCase(planRepo);
    const transitionActionPlanStatusUseCase = new transition_action_plan_status_use_case_1.TransitionActionPlanStatusUseCase(planRepo);
    const getRecommendedTemplatesUseCase = new get_recommended_templates_use_case_1.GetRecommendedTemplatesUseCase(tplRepo);
    const syncExternalTaskUseCase = new sync_external_task_use_case_1.SyncExternalTaskUseCase(planRepo);
    const listActionPlansUseCase = new list_action_plans_use_case_1.ListActionPlansUseCase(planRepo);
    const getActionPlanUseCase = new get_action_plan_use_case_1.GetActionPlanUseCase(planRepo);
    const updateActionPlanUseCase = new update_action_plan_use_case_1.UpdateActionPlanUseCase(planRepo);
    const deleteActionPlanUseCase = new delete_action_plan_use_case_1.DeleteActionPlanUseCase(planRepo);
    const controller = new action_controller_1.ActionController(createActionPlanUseCase, transitionActionPlanStatusUseCase, getRecommendedTemplatesUseCase, syncExternalTaskUseCase, listActionPlansUseCase, getActionPlanUseCase, updateActionPlanUseCase, deleteActionPlanUseCase);
    router.use('/actions', auth_middleware_1.authenticate);
    router.post('/actions', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.createActionPlan);
    router.get('/actions/kanban', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getKanban);
    router.get('/actions/templates/recommendations', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.getTemplates);
    router.get('/actions/:actionPlanId', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getActionPlan);
    router.put('/actions/:actionPlanId', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.updateActionPlan);
    router.patch('/actions/:actionPlanId/milestones/:milestoneId', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.toggleMilestone);
    router.delete('/actions/:actionPlanId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.deleteActionPlan);
    router.post('/actions/:actionPlanId/transition', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.transitionStatus);
    router.post(['/actions/:actionPlanId/sync', '/actions/:actionPlanId/sync-external'], (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ]), controller.syncTask);
    return router;
}
//# sourceMappingURL=action.routes.js.map