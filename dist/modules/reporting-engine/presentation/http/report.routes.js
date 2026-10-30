"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportingEngineRouter = createReportingEngineRouter;
const express_1 = require("express");
const report_job_repository_1 = require("../../infrastructure/persistence/mongoose/report-job.repository");
const request_report_generation_use_case_1 = require("../../application/use-cases/request-report-generation.use-case");
const get_report_job_status_use_case_1 = require("../../application/use-cases/get-report-job-status.use-case");
const list_report_jobs_use_case_1 = require("../../application/use-cases/list-report-jobs.use-case");
const delete_report_job_use_case_1 = require("../../application/use-cases/delete-report-job.use-case");
const report_controller_1 = require("./report.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
function createReportingEngineRouter(reportJobRepo) {
    const router = (0, express_1.Router)();
    const rRepo = reportJobRepo || new report_job_repository_1.ReportJobMongoRepository();
    const requestReportGenerationUseCase = new request_report_generation_use_case_1.RequestReportGenerationUseCase(rRepo);
    const getReportJobStatusUseCase = new get_report_job_status_use_case_1.GetReportJobStatusUseCase(rRepo);
    const listReportJobsUseCase = new list_report_jobs_use_case_1.ListReportJobsUseCase(rRepo);
    const deleteReportJobUseCase = new delete_report_job_use_case_1.DeleteReportJobUseCase(rRepo, storage_service_1.StorageService.getInstance());
    const controller = new report_controller_1.ReportController(requestReportGenerationUseCase, getReportJobStatusUseCase, listReportJobsUseCase, storage_service_1.StorageService.getInstance(), deleteReportJobUseCase, rRepo);
    router.use('/reports', auth_middleware_1.authenticate);
    router.post('/reports/generate', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.requestReport);
    router.get('/reports/jobs/:jobId', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getJobStatus);
    router.get('/reports/jobs', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.listJobs);
    router.get('/reports/:reportId/download', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.downloadReport);
    router.get('/reports/jobs/:jobId/download', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.downloadReport);
    router.delete('/reports/jobs/:jobId', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
    ]), controller.deleteJob);
    router.delete('/reports/:reportId', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
    ]), controller.deleteJob);
    return router;
}
//# sourceMappingURL=report.routes.js.map