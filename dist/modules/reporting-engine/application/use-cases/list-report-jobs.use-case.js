"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListReportJobsUseCase = void 0;
class ListReportJobsUseCase {
    reportJobRepo;
    constructor(reportJobRepo) {
        this.reportJobRepo = reportJobRepo;
    }
    async execute(projectId, requestedBy) {
        return await this.reportJobRepo.findAllByProject(projectId, requestedBy);
    }
}
exports.ListReportJobsUseCase = ListReportJobsUseCase;
//# sourceMappingURL=list-report-jobs.use-case.js.map