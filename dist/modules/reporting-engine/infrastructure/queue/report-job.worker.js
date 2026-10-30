"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportJobWorker = void 0;
const report_job_queue_1 = require("./report-job.queue");
const report_job_entity_1 = require("../../domain/entities/report-job.entity");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
const csv_report_generator_1 = require("../generators/csv-report.generator");
const pdf_report_generator_1 = require("../generators/pdf-report.generator");
const excel_report_generator_1 = require("../generators/excel-report.generator");
const ppt_report_generator_1 = require("../generators/ppt-report.generator");
const prompt_report_generator_1 = require("../generators/prompt-report.generator");
const report_generated_event_1 = require("../../domain/events/report-generated.event");
const fs_1 = __importDefault(require("fs"));
class ReportJobWorker {
    queue;
    reportJobRepo;
    eventBus;
    storageService;
    static instance;
    isProcessing = false;
    csvGenerator;
    pdfGenerator;
    excelGenerator;
    pptGenerator;
    promptGenerator;
    constructor(queue, reportJobRepo, eventBus = event_bus_1.DomainEventBus.getInstance(), storageService = storage_service_1.StorageService.getInstance()) {
        this.queue = queue;
        this.reportJobRepo = reportJobRepo;
        this.eventBus = eventBus;
        this.storageService = storageService;
        this.csvGenerator = new csv_report_generator_1.CsvReportGenerator();
        this.pdfGenerator = new pdf_report_generator_1.PdfReportGenerator();
        this.excelGenerator = new excel_report_generator_1.ExcelReportGenerator();
        this.pptGenerator = new ppt_report_generator_1.PptReportGenerator();
        this.promptGenerator = new prompt_report_generator_1.PromptReportGenerator();
    }
    static getInstance(reportJobRepo, eventBus, queue, storageService) {
        if (!ReportJobWorker.instance) {
            ReportJobWorker.instance = new ReportJobWorker(queue || report_job_queue_1.PersistentReportJobQueue.getInstance(), reportJobRepo, eventBus || event_bus_1.DomainEventBus.getInstance(), storageService || storage_service_1.StorageService.getInstance());
        }
        return ReportJobWorker.instance;
    }
    triggerProcessing() {
        setImmediate(async () => {
            await this.processQueue();
        });
    }
    async processQueue() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        try {
            let hasMore = true;
            while (hasMore) {
                hasMore = await this.processNext();
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processNext() {
        const jobPayload = await this.queue.dequeue();
        if (!jobPayload)
            return false;
        await this.processJob(jobPayload);
        return true;
    }
    async processJob(jobPayload) {
        const { jobId, projectId, campaignId, reportType, format, requestedBy } = jobPayload;
        let job = null;
        if (typeof this.reportJobRepo.findByJobId === 'function') {
            job = await this.reportJobRepo.findByJobId(projectId, jobId);
        }
        if (!job) {
            job = new report_job_entity_1.ReportJobEntity({
                projectId,
                campaignId,
                jobId,
                reportType,
                nodeId: jobPayload.nodeId,
                requestedBy,
                status: 'QUEUED',
            });
        }
        try {
            job.status = 'PROCESSING';
            await this.reportJobRepo.save(job);
            const scopeType = jobPayload.scopeType || (jobPayload.nodeId ? 'DEPARTMENT' : 'ORGANIZATION');
            const scopeFilter = jobPayload.scopeFilter || (jobPayload.nodeId ? { nodeId: jobPayload.nodeId } : undefined);
            const title = jobPayload.title || `Enterprise Survey Report (${scopeType})`;
            let fileBuffer;
            let ext;
            let contentType;
            if (format === 'PROMPT' ||
                reportType === 'AGENTIC_PROMPT_PACK' ||
                reportType?.includes('PROMPT') ||
                reportType?.includes('AGENTIC')) {
                ext = 'md';
                contentType = 'text/markdown; charset=utf-8';
                const res = await this.promptGenerator.generatePrompt({
                    reportId: jobId,
                    projectId,
                    campaignId,
                    title,
                    scopeType,
                    scopeFilter,
                    requestedBy,
                    branding: jobPayload.branding,
                    benchmark: jobPayload.benchmark,
                    bypassPrivacy: jobPayload.bypassPrivacy,
                    includeAiSentimentSummary: jobPayload.includeAiSentimentSummary ?? true,
                    includeBenchmarkComparison: jobPayload.includeBenchmarkComparison ?? true,
                });
                if (res?.promptContent) {
                    fileBuffer = Buffer.from(res.promptContent, 'utf-8');
                }
                else if (res?.filePath) {
                    fileBuffer = await fs_1.default.promises.readFile(res.filePath);
                }
                else {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
            }
            else if (format === 'POWERPOINT' ||
                reportType === 'BOARDROOM_DECK_POWERPOINT' ||
                reportType?.includes('POWERPOINT') ||
                reportType?.includes('PPT')) {
                ext = 'pptx';
                contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                const res = await this.pptGenerator.generatePpt({
                    reportId: jobId,
                    projectId,
                    campaignId,
                    title,
                    scopeType,
                    scopeFilter,
                    requestedBy,
                    branding: jobPayload.branding,
                    benchmark: jobPayload.benchmark,
                    bypassPrivacy: jobPayload.bypassPrivacy,
                });
                if (!res?.filePath) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
                fileBuffer = await fs_1.default.promises.readFile(res.filePath);
                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
            }
            else if (format === 'EXCEL' ||
                reportType === 'AGGREGATED_SCORES_XLSX') {
                ext = 'xlsx';
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                const res = await this.excelGenerator.generateExcel({
                    reportId: jobId,
                    projectId,
                    campaignId,
                    title,
                    scopeType,
                    scopeFilter,
                    includeAiSentimentSummary: jobPayload.includeAiSentimentSummary ?? true,
                    includeBenchmarkComparison: jobPayload.includeBenchmarkComparison ?? true,
                    requestedBy,
                    branding: jobPayload.branding,
                    benchmark: jobPayload.benchmark,
                    bypassPrivacy: jobPayload.bypassPrivacy,
                });
                if (!res?.filePath) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
                fileBuffer = await fs_1.default.promises.readFile(res.filePath);
                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
            }
            else if (format === 'PDF' ||
                reportType === 'EXEC_SUMMARY_PDF' ||
                reportType === 'DEPT_BREAKDOWN_PDF' ||
                reportType?.includes('PDF')) {
                ext = 'pdf';
                contentType = 'application/pdf';
                const res = await this.pdfGenerator.generatePdf({
                    reportId: jobId,
                    projectId,
                    campaignId,
                    title,
                    scopeType,
                    scopeFilter,
                    includeAiSentimentSummary: jobPayload.includeAiSentimentSummary ?? true,
                    includeBenchmarkComparison: jobPayload.includeBenchmarkComparison ?? true,
                    passwordProtected: jobPayload.passwordProtected ?? !!jobPayload.pdfPassword,
                    pdfPassword: jobPayload.pdfPassword,
                    requestedBy,
                    branding: jobPayload.branding,
                    benchmark: jobPayload.benchmark,
                    bypassPrivacy: jobPayload.bypassPrivacy,
                });
                if (res?.pdfBuffer && res.pdfBuffer.length > 0) {
                    fileBuffer = res.pdfBuffer;
                }
                else if (res?.filePath) {
                    fileBuffer = await fs_1.default.promises.readFile(res.filePath);
                }
                else {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
            }
            else {
                ext = 'csv';
                contentType = 'text/csv';
                const res = await this.csvGenerator.generateReport({
                    projectId,
                    campaignId,
                    reportId: jobId,
                    reportType,
                    nodeId: jobPayload.nodeId,
                    requestedBy,
                    bypassPrivacy: jobPayload.bypassPrivacy,
                });
                if (!res?.filePath) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
                fileBuffer = await fs_1.default.promises.readFile(res.filePath);
                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Export generation failed: Empty file output produced by generator');
                }
            }
            // Stream / Upload artifact to cloud storage (S3/MinIO)
            const storageKey = `reports/${projectId}/${jobId}.${ext}`;
            await this.storageService.uploadArtifact(storageKey, fileBuffer, contentType);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const presignedUrl = await this.storageService.getPresignedDownloadUrl(storageKey, 86400);
            const downloadEndpoint = `/api/v1/reports/${jobId}/download`;
            // Complete job with download URL and file size
            job.completeJob(downloadEndpoint, expiresAt, fileBuffer.length);
            await this.reportJobRepo.save(job);
            // Emit domain event
            const event = new report_generated_event_1.ReportGeneratedEvent({
                projectId,
                campaignId,
                jobId,
                reportType,
                downloadUrl: presignedUrl,
                expiresAt: expiresAt.toISOString(),
            });
            await this.eventBus.publish(event);
        }
        catch (err) {
            console.error(`[ReportJobWorker] Error compiling report ${jobId}:`, err);
            const attempts = (jobPayload.attempts || 0) + 1;
            const maxAttempts = jobPayload.maxAttempts || 3;
            if (attempts < maxAttempts) {
                console.warn(`[ReportJobWorker] Retrying report ${jobId} (attempt ${attempts}/${maxAttempts})...`);
                jobPayload.attempts = attempts;
                const delayMs = Math.pow(2, attempts) * 50;
                if (delayMs > 0 && process.env.NODE_ENV !== 'test') {
                    setTimeout(async () => {
                        await this.queue.enqueue(jobPayload);
                        this.triggerProcessing();
                    }, delayMs);
                }
                else {
                    await this.queue.enqueue(jobPayload);
                    this.triggerProcessing();
                }
            }
            else {
                job.failJob(err.message || 'Report generation failed');
                await this.reportJobRepo.save(job);
            }
        }
    }
}
exports.ReportJobWorker = ReportJobWorker;
//# sourceMappingURL=report-job.worker.js.map