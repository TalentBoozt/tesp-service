"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const delete_report_job_use_case_1 = require("../../application/use-cases/delete-report-job.use-case");
const report_job_dto_1 = require("../../application/dto/report-job.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
const report_job_repository_1 = require("../../infrastructure/persistence/mongoose/report-job.repository");
class ReportController {
    requestReportGenerationUseCase;
    getReportJobStatusUseCase;
    listReportJobsUseCase;
    deleteReportJobUseCase;
    reportJobRepo;
    storageService;
    constructor(requestReportGenerationUseCase, getReportJobStatusUseCase, listReportJobsUseCase, storageService, deleteReportJobUseCase, reportJobRepo) {
        this.requestReportGenerationUseCase = requestReportGenerationUseCase;
        this.getReportJobStatusUseCase = getReportJobStatusUseCase;
        this.listReportJobsUseCase = listReportJobsUseCase;
        this.deleteReportJobUseCase = deleteReportJobUseCase;
        this.reportJobRepo = reportJobRepo;
        this.storageService = storageService || storage_service_1.StorageService.getInstance();
    }
    requestReport = async (req, res, next) => {
        try {
            const body = { ...req.body };
            if (!body.projectId) {
                body.projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            }
            if (!body.campaignId) {
                body.campaignId = body.surveyId || 'CMP-1001';
            }
            if (!body.reportType || body.reportType === 'SCOPED_REPORT') {
                if (body.format === 'PROMPT') {
                    body.reportType = 'AGENTIC_PROMPT_PACK';
                }
                else if (body.format === 'POWERPOINT') {
                    body.reportType = 'BOARDROOM_DECK_POWERPOINT';
                }
                else if (body.format === 'EXCEL' || body.format === 'CSV') {
                    body.reportType = 'RAW_RESPONSES_XLSX';
                }
                else {
                    body.reportType = 'EXEC_SUMMARY_PDF';
                }
            }
            // Check if caller is Super Admin or explicitly requested bypass
            const isSuperAdmin = req.user?.role === auth_middleware_1.UserRole.SUPER_ADMIN ||
                Boolean(req.user?.authorizedProjectIds?.includes('*'));
            if (isSuperAdmin) {
                body.bypassPrivacy = body.bypassPrivacy ?? true;
            }
            else {
                body.bypassPrivacy = false;
            }
            const parsed = report_job_dto_1.RequestReportGenerationDtoSchema.safeParse(body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail);
            }
            const requestedBy = req.user?.userId || 'USR-ADMIN';
            const result = await this.requestReportGenerationUseCase.execute(parsed.data, requestedBy);
            res.status(202).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getJobStatus = async (req, res, next) => {
        try {
            const { jobId } = req.params;
            const isSuperAdmin = req.user?.role === auth_middleware_1.UserRole.SUPER_ADMIN;
            let projectId = req.user?.projectId;
            if (!projectId) {
                try {
                    projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
                }
                catch (tErr) {
                    if (!isSuperAdmin)
                        throw tErr;
                }
            }
            let job = null;
            if (typeof this.reportJobRepo?.findByJobIdOnly === 'function') {
                try {
                    job = await this.reportJobRepo.findByJobIdOnly(jobId);
                }
                catch { }
            }
            if (!job && projectId) {
                job = await this.getReportJobStatusUseCase.execute(projectId, jobId);
            }
            if (!job) {
                throw new error_middleware_1.AppError(404, `Report job '${jobId}' not found`);
            }
            res.status(200).json(job.toJSON());
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message));
                return;
            }
            next(err);
        }
    };
    listJobs = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const requestedBy = req.user?.userId;
            const jobs = await this.listReportJobsUseCase.execute(projectId, requestedBy);
            res.status(200).json({
                total: jobs.length,
                jobs: jobs.map((j) => j.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
    downloadReport = async (req, res, next) => {
        try {
            const reportId = req.params.reportId || req.params.jobId;
            if (!reportId) {
                throw new error_middleware_1.AppError(400, 'Report ID is required for download');
            }
            // Security Check: Strictly validate reportId format to prevent directory traversal
            const validReportIdPattern = /^[a-zA-Z0-9_-]+(\.(pdf|xlsx|pptx|csv|md))?$/i;
            if (!validReportIdPattern.test(reportId) || reportId.includes('..') || reportId.includes('/') || reportId.includes('\\')) {
                throw new error_middleware_1.AppError(400, 'Invalid report ID: Malformed or prohibited path characters');
            }
            const ext = path_1.default.extname(reportId);
            const baseId = ext ? path_1.default.basename(reportId, ext) : reportId;
            // Tenancy validation: Ensure caller has permission for this report's project
            const userProjectId = req.user?.projectId;
            const isSuperAdmin = req.user?.role === auth_middleware_1.UserRole.SUPER_ADMIN;
            // Lookup job to find authoritative project and report type
            let job = null;
            if (typeof this.reportJobRepo?.findByJobIdOnly === 'function') {
                try {
                    job = await this.reportJobRepo.findByJobIdOnly(baseId);
                }
                catch { }
            }
            let effectiveProjectId = job?.projectId || userProjectId;
            if (!effectiveProjectId) {
                try {
                    effectiveProjectId = (0, tenant_context_1.resolveTenantProjectId)(req);
                }
                catch (tErr) {
                    if (!isSuperAdmin && !job) {
                        throw tErr;
                    }
                }
            }
            if (!job && effectiveProjectId) {
                try {
                    job = await this.getReportJobStatusUseCase.execute(effectiveProjectId, baseId);
                }
                catch { }
            }
            if (!isSuperAdmin) {
                if (!effectiveProjectId && !job) {
                    throw new error_middleware_1.AppError(403, 'Missing project context for report access');
                }
                if (job && effectiveProjectId && job.projectId !== effectiveProjectId) {
                    throw new error_middleware_1.AppError(403, 'Access denied: Report belongs to another organization');
                }
            }
            if (job) {
                effectiveProjectId = job.projectId;
            }
            // Determine report extension / type
            let resolvedExt = ext ? ext.replace(/^\./, '').toLowerCase() : '';
            if (!resolvedExt && job) {
                if (job.reportType?.includes('PROMPT') ||
                    job.reportType?.includes('AGENTIC') ||
                    job.reportType?.includes('MD')) {
                    resolvedExt = 'md';
                }
                else if (job.reportType?.includes('POWERPOINT') ||
                    job.reportType?.includes('PPTX') ||
                    job.reportType?.includes('PPT')) {
                    resolvedExt = 'pptx';
                }
                else if (job.reportType?.includes('XLSX') || job.reportType?.includes('EXCEL')) {
                    resolvedExt = 'xlsx';
                }
                else if (job.reportType?.includes('CSV')) {
                    resolvedExt = 'csv';
                }
                else if (job.reportType?.includes('PDF')) {
                    resolvedExt = 'pdf';
                }
            }
            if (!resolvedExt)
                resolvedExt = 'pdf';
            const storageKey = `reports/${effectiveProjectId || 'default'}/${baseId}.${resolvedExt}`;
            const presignedUrl = await this.storageService.getPresignedDownloadUrl(storageKey, 900);
            // Presigned download URL flow (GAP-008 / TASK-04-02)
            if (req.query.presigned === 'true' || req.headers.accept?.includes('application/json')) {
                res.status(200).json({
                    downloadUrl: presignedUrl,
                    presignedUrl,
                    expiresInSeconds: 900,
                });
                return;
            }
            if (req.query.redirect === 'true') {
                res.redirect(302, presignedUrl);
                return;
            }
            // 1. Stream from StorageService if buffer is available
            let buffer = await this.storageService.getArtifactBuffer(storageKey);
            // 2. Try candidate keys in storage
            if (!buffer) {
                const candidateKeys = [
                    `reports/${job?.projectId}/${baseId}.${resolvedExt}`,
                    `reports/${baseId}.${resolvedExt}`,
                    `${baseId}.${resolvedExt}`,
                ];
                for (const k of candidateKeys) {
                    if (k !== storageKey) {
                        buffer = await this.storageService.getArtifactBuffer(k);
                        if (buffer)
                            break;
                    }
                }
            }
            // 3. Fallback to local reports directory
            const reportsDir = path_1.default.resolve(process.cwd(), 'tmp', 'reports');
            const candidates = [
                path_1.default.resolve(reportsDir, `${baseId}.${resolvedExt}`),
                path_1.default.resolve(reportsDir, `${baseId}.md`),
                path_1.default.resolve(reportsDir, `${baseId}.pptx`),
                path_1.default.resolve(reportsDir, `${baseId}.xlsx`),
                path_1.default.resolve(reportsDir, `${baseId}.pdf`),
                path_1.default.resolve(reportsDir, `${baseId}.csv`),
                path_1.default.resolve(reportsDir, 'storage', 'reports', effectiveProjectId || '', `${baseId}.${resolvedExt}`),
            ];
            let foundPath = null;
            if (!buffer) {
                for (const cand of candidates) {
                    const normalizedCand = path_1.default.resolve(cand);
                    if (fs_1.default.existsSync(normalizedCand) && fs_1.default.statSync(normalizedCand).isFile()) {
                        foundPath = normalizedCand;
                        const candExt = path_1.default.extname(cand).replace(/^\./, '').toLowerCase();
                        if (candExt)
                            resolvedExt = candExt;
                        break;
                    }
                }
            }
            if (!buffer && !foundPath) {
                throw new error_middleware_1.AppError(404, 'Report file not found or expired');
            }
            const contentType = resolvedExt === 'md'
                ? 'text/markdown; charset=utf-8'
                : resolvedExt === 'pptx'
                    ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    : resolvedExt === 'xlsx'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : resolvedExt === 'csv'
                            ? 'text/csv'
                            : 'application/pdf';
            res.setHeader('Content-Type', contentType);
            res.setHeader('X-Presigned-Url', presignedUrl);
            if (buffer) {
                res.setHeader('Content-Disposition', `attachment; filename="report-${baseId}.${resolvedExt}"`);
                res.setHeader('Content-Length', buffer.length);
                res.status(200).send(buffer);
                return;
            }
            if (foundPath) {
                const downloadFileName = `report-${path_1.default.basename(foundPath)}`;
                res.download(foundPath, downloadFileName);
                return;
            }
        }
        catch (err) {
            next(err);
        }
    };
    deleteJob = async (req, res, next) => {
        try {
            const reportId = req.params.reportId || req.params.jobId;
            if (!reportId) {
                throw new error_middleware_1.AppError(400, 'Report ID is required');
            }
            // Security check: validate ID pattern
            const validReportIdPattern = /^[a-zA-Z0-9_-]+(\.(pdf|xlsx|pptx|csv))?$/i;
            if (!validReportIdPattern.test(reportId) || reportId.includes('..') || reportId.includes('/') || reportId.includes('\\')) {
                throw new error_middleware_1.AppError(400, 'Invalid report ID: Malformed or prohibited path characters');
            }
            const ext = path_1.default.extname(reportId);
            const baseId = ext ? path_1.default.basename(reportId, ext) : reportId;
            const isSuperAdmin = req.user?.role === auth_middleware_1.UserRole.SUPER_ADMIN;
            let effectiveProjectId = req.user?.projectId;
            if (!effectiveProjectId) {
                try {
                    effectiveProjectId = (0, tenant_context_1.resolveTenantProjectId)(req);
                }
                catch {
                    // Permitted for Super Admin
                }
            }
            if (!this.deleteReportJobUseCase) {
                const rRepo = this.reportJobRepo || new report_job_repository_1.ReportJobMongoRepository();
                this.deleteReportJobUseCase = new delete_report_job_use_case_1.DeleteReportJobUseCase(rRepo, this.storageService);
            }
            const success = await this.deleteReportJobUseCase.execute(baseId, effectiveProjectId, isSuperAdmin);
            if (!success) {
                throw new error_middleware_1.AppError(404, 'Report job not found or already deleted');
            }
            res.status(200).json({
                success: true,
                message: `Report record '${baseId}' deleted successfully`,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map