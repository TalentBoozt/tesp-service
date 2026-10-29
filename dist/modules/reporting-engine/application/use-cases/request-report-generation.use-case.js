"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestReportGenerationUseCase = void 0;
const report_job_entity_1 = require("../../domain/entities/report-job.entity");
const report_job_queue_1 = require("../../infrastructure/queue/report-job.queue");
const report_job_worker_1 = require("../../infrastructure/queue/report-job.worker");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
class RequestReportGenerationUseCase {
    reportJobRepo;
    eventBus;
    projectRepo;
    reportQueue;
    reportWorker;
    constructor(reportJobRepo, eventBus = event_bus_1.DomainEventBus.getInstance(), reportQueue, reportWorker, projectRepo) {
        this.reportJobRepo = reportJobRepo;
        this.eventBus = eventBus;
        this.projectRepo = projectRepo;
        this.reportQueue = reportQueue || report_job_queue_1.PersistentReportJobQueue.getInstance();
        this.reportWorker = reportWorker || new report_job_worker_1.ReportJobWorker(this.reportQueue, reportJobRepo, eventBus);
    }
    get pdfGenerator() {
        return this.reportWorker.pdfGenerator;
    }
    set pdfGenerator(val) {
        this.reportWorker.pdfGenerator = val;
    }
    get excelGenerator() {
        return this.reportWorker.excelGenerator;
    }
    set excelGenerator(val) {
        this.reportWorker.excelGenerator = val;
    }
    async execute(dto, requestedBy) {
        const jobId = `JOB-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const determinedReportType = dto.reportType ||
            (dto.format === 'EXCEL'
                ? 'RAW_RESPONSES_XLSX'
                : dto.format === 'POWERPOINT'
                    ? 'BOARDROOM_DECK_POWERPOINT'
                    : 'EXEC_SUMMARY_PDF');
        const job = new report_job_entity_1.ReportJobEntity({
            projectId: dto.projectId,
            campaignId: dto.campaignId,
            jobId,
            reportType: determinedReportType,
            nodeId: dto.nodeId || dto.scopeFilter?.nodeId,
            requestedBy,
            status: 'QUEUED',
        });
        await this.reportJobRepo.save(job);
        let branding;
        let benchmark;
        if (this.projectRepo) {
            try {
                const project = await this.projectRepo.findByProjectId(dto.projectId);
                if (project) {
                    if (project.branding) {
                        branding = {
                            primaryColor: project.branding.primaryColor,
                            logoUrl: project.branding.logoUrl,
                            organizationName: project.branding.companyName || project.name,
                        };
                    }
                    if (project.benchmarkSettings) {
                        benchmark = project.benchmarkSettings.overallScoreBenchmark ?? null;
                    }
                }
            }
            catch {
                // Fallback gracefully
            }
        }
        // Persistent asynchronous job queue dispatch (GAP-008 / TASK-04-01)
        await this.reportQueue.enqueue({
            jobId,
            projectId: dto.projectId,
            campaignId: dto.campaignId,
            reportType: determinedReportType,
            format: dto.format,
            nodeId: dto.nodeId || dto.scopeFilter?.nodeId,
            scopeType: dto.scopeType || (dto.nodeId ? 'DEPARTMENT' : 'ORGANIZATION'),
            scopeFilter: dto.scopeFilter || (dto.nodeId ? { nodeId: dto.nodeId } : undefined),
            title: dto.title,
            includeAiSentimentSummary: dto.includeAiSentimentSummary ?? true,
            includeBenchmarkComparison: dto.includeBenchmarkComparison ?? true,
            passwordProtected: dto.passwordProtected ?? (!!dto.pdfPassword),
            pdfPassword: dto.pdfPassword,
            requestedBy,
            branding,
            benchmark,
            bypassPrivacy: dto.bypassPrivacy,
        });
        // Trigger managed background queue worker
        this.reportWorker.triggerProcessing();
        return {
            jobId,
            status: 'QUEUED',
            estimatedDurationSeconds: 3,
        };
    }
}
exports.RequestReportGenerationUseCase = RequestReportGenerationUseCase;
//# sourceMappingURL=request-report-generation.use-case.js.map