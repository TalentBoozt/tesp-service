"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportJobStatusUseCase = void 0;
class GetReportJobStatusUseCase {
    reportJobRepo;
    constructor(reportJobRepo) {
        this.reportJobRepo = reportJobRepo;
    }
    async execute(projectId, jobId) {
        const job = await this.reportJobRepo.findByJobId(projectId, jobId);
        if (!job) {
            throw new Error(`Report job '${jobId}' not found`);
        }
        return job;
    }
}
exports.GetReportJobStatusUseCase = GetReportJobStatusUseCase;
//# sourceMappingURL=get-report-job-status.use-case.js.map