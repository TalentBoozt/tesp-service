"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReportJobUseCase = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
class DeleteReportJobUseCase {
    reportJobRepo;
    storageService;
    constructor(reportJobRepo, storageService = storage_service_1.StorageService.getInstance()) {
        this.reportJobRepo = reportJobRepo;
        this.storageService = storageService;
    }
    async execute(jobId, projectId, isSuperAdmin = false) {
        // 1. Fetch the job details
        let job = null;
        if (typeof this.reportJobRepo.findByJobIdOnly === 'function') {
            job = await this.reportJobRepo.findByJobIdOnly(jobId);
        }
        if (!job && projectId) {
            job = await this.reportJobRepo.findByJobId(projectId, jobId);
        }
        if (job && !isSuperAdmin && projectId && job.projectId !== projectId) {
            throw new Error('Access denied: Cannot delete report belonging to another project');
        }
        const effectiveProjectId = job?.projectId || projectId || '';
        // 2. Remove generated file artifacts if present
        const exts = ['pdf', 'xlsx', 'csv', 'pptx'];
        for (const ext of exts) {
            const storageKey = `reports/${effectiveProjectId}/${jobId}.${ext}`;
            try {
                await this.storageService.deleteArtifact(storageKey);
            }
            catch { }
            const reportsDir = path_1.default.resolve(process.cwd(), 'tmp', 'reports');
            const localFile = path_1.default.resolve(reportsDir, `${jobId}.${ext}`);
            try {
                if (fs_1.default.existsSync(localFile)) {
                    await fs_1.default.promises.unlink(localFile);
                }
            }
            catch { }
            const localFallbackFile = path_1.default.resolve(reportsDir, 'storage', 'reports', effectiveProjectId, `${jobId}.${ext}`);
            try {
                if (fs_1.default.existsSync(localFallbackFile)) {
                    await fs_1.default.promises.unlink(localFallbackFile);
                }
            }
            catch { }
        }
        // 3. Delete job record from repository
        if (typeof this.reportJobRepo.deleteJob === 'function') {
            const deleted = await this.reportJobRepo.deleteJob(jobId, isSuperAdmin ? undefined : effectiveProjectId);
            if (deleted)
                return true;
        }
        // If job wasn't found in repo but artifacts were cleaned, or if repo delete returned true
        return job !== null;
    }
}
exports.DeleteReportJobUseCase = DeleteReportJobUseCase;
//# sourceMappingURL=delete-report-job.use-case.js.map