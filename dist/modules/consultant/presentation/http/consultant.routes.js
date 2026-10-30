"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsultantRouter = createConsultantRouter;
const express_1 = require("express");
const consultant_repository_1 = require("../../infrastructure/persistence/mongoose/consultant.repository");
const consultant_use_cases_1 = require("../../application/use-cases/consultant.use-cases");
const consultant_controller_1 = require("./consultant.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createConsultantRouter(repository) {
    const router = (0, express_1.Router)();
    const repo = repository || new consultant_repository_1.ConsultantMongoRepository();
    const listEngagementsUseCase = new consultant_use_cases_1.ListEngagementsUseCase(repo);
    const getBenchmarksUseCase = new consultant_use_cases_1.GetBenchmarksUseCase(repo);
    const createWorkshopUseCase = new consultant_use_cases_1.CreateWorkshopUseCase(repo);
    const updateWorkshopUseCase = new consultant_use_cases_1.UpdateWorkshopUseCase(repo);
    const deleteWorkshopUseCase = new consultant_use_cases_1.DeleteWorkshopUseCase(repo);
    const listWorkshopsUseCase = new consultant_use_cases_1.ListWorkshopsUseCase(repo);
    const getSignoffQueueUseCase = new consultant_use_cases_1.GetSignoffQueueUseCase(repo);
    const signoffAiFindingUseCase = new consultant_use_cases_1.SignoffAiFindingUseCase(repo);
    const getAiThemesUseCase = new consultant_use_cases_1.GetAiThemesUseCase();
    const controller = new consultant_controller_1.ConsultantController(listEngagementsUseCase, getBenchmarksUseCase, createWorkshopUseCase, listWorkshopsUseCase, getSignoffQueueUseCase, signoffAiFindingUseCase, updateWorkshopUseCase, deleteWorkshopUseCase, getAiThemesUseCase);
    router.use('/consultant', auth_middleware_1.authenticate);
    const consultantRoles = [
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
    ];
    router.get('/consultant/workspace', (0, auth_middleware_1.authorize)(consultantRoles), controller.getWorkspace);
    router.get('/consultant/engagements', (0, auth_middleware_1.authorize)(consultantRoles), controller.getEngagements);
    router.get('/consultant/benchmarks', (0, auth_middleware_1.authorize)(consultantRoles), controller.getBenchmarks);
    router.get('/consultant/workshops', (0, auth_middleware_1.authorize)(consultantRoles), controller.getWorkshops);
    router.post('/consultant/workshops', (0, auth_middleware_1.authorize)(consultantRoles), controller.createWorkshop);
    router.patch('/consultant/workshops/:id', (0, auth_middleware_1.authorize)(consultantRoles), controller.updateWorkshop);
    router.delete('/consultant/workshops/:id', (0, auth_middleware_1.authorize)(consultantRoles), controller.deleteWorkshop);
    router.get('/consultant/ai-themes', (0, auth_middleware_1.authorize)(consultantRoles), controller.getAiThemes);
    router.get('/consultant/ai-signoff', (0, auth_middleware_1.authorize)(consultantRoles), controller.getSignoffQueue);
    router.post('/consultant/ai-signoff/:id', (0, auth_middleware_1.authorize)(consultantRoles), controller.signoffAiFinding);
    return router;
}
//# sourceMappingURL=consultant.routes.js.map