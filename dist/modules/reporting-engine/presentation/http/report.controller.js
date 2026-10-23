"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const report_job_dto_1 = require("../../application/dto/report-job.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class ReportController {
    requestReportGenerationUseCase;
    getReportJobStatusUseCase;
    listReportJobsUseCase;
    constructor(requestReportGenerationUseCase, getReportJobStatusUseCase, listReportJobsUseCase) {
        this.requestReportGenerationUseCase = requestReportGenerationUseCase;
        this.getReportJobStatusUseCase = getReportJobStatusUseCase;
        this.listReportJobsUseCase = listReportJobsUseCase;
    }
    requestReport = async (req, res, next) => {
        try {
            const body = { ...req.body };
            if (!body.projectId) {
                body.projectId = req.user?.projectId || 'PRJ-99201';
            }
            if (!body.campaignId) {
                body.campaignId = body.surveyId || 'CMP-1001';
            }
            if (!body.reportType) {
                if (body.format === 'EXCEL' || body.format === 'CSV') {
                    body.reportType = 'RAW_RESPONSES_XLSX';
                }
                else {
                    body.reportType = 'EXEC_SUMMARY_PDF';
                }
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
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-99201';
            const job = await this.getReportJobStatusUseCase.execute(projectId, jobId);
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
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-99201';
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
            const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
            const ext = path_1.default.extname(reportId);
            const baseId = ext ? path_1.default.basename(reportId, ext) : reportId;
            let candidates = [];
            if (ext) {
                candidates = [path_1.default.join(reportsDir, reportId)];
            }
            else {
                let isPdf = false;
                try {
                    const projectId = req.user?.projectId || 'PRJ-99201';
                    const job = await this.getReportJobStatusUseCase.execute(projectId, baseId);
                    if (job.reportType?.includes('PDF')) {
                        isPdf = true;
                    }
                }
                catch {
                    // If repo lookup fails, fallback to checking disk
                }
                candidates = isPdf
                    ? [
                        path_1.default.join(reportsDir, `${baseId}.pdf`),
                        path_1.default.join(reportsDir, `${baseId}.xlsx`),
                        path_1.default.join(reportsDir, `${baseId}.pptx`),
                        path_1.default.join(reportsDir, `${baseId}.csv`),
                    ]
                    : [
                        path_1.default.join(reportsDir, `${baseId}.xlsx`),
                        path_1.default.join(reportsDir, `${baseId}.pptx`),
                        path_1.default.join(reportsDir, `${baseId}.pdf`),
                        path_1.default.join(reportsDir, `${baseId}.csv`),
                    ];
            }
            let foundPath = null;
            for (const cand of candidates) {
                if (fs_1.default.existsSync(cand) && fs_1.default.statSync(cand).isFile()) {
                    foundPath = cand;
                    break;
                }
            }
            if (!foundPath) {
                throw new error_middleware_1.AppError(404, 'Report file not found or expired');
            }
            const downloadFileName = `report-${path_1.default.basename(foundPath)}`;
            res.download(foundPath, downloadFileName);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map