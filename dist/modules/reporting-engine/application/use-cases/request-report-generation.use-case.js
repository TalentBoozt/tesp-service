"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestReportGenerationUseCase = void 0;
const report_job_entity_1 = require("../../domain/entities/report-job.entity");
const csv_report_generator_1 = require("../../infrastructure/generators/csv-report.generator");
const pdf_report_generator_1 = require("../../infrastructure/generators/pdf-report.generator");
const excel_report_generator_1 = require("../../infrastructure/generators/excel-report.generator");
const ppt_report_generator_1 = require("../../infrastructure/generators/ppt-report.generator");
const report_generated_event_1 = require("../../domain/events/report-generated.event");
class RequestReportGenerationUseCase {
    reportJobRepo;
    csvGenerator;
    pdfGenerator;
    excelGenerator;
    pptGenerator;
    constructor(reportJobRepo) {
        this.reportJobRepo = reportJobRepo;
        this.csvGenerator = new csv_report_generator_1.CsvReportGenerator();
        this.pdfGenerator = new pdf_report_generator_1.PdfReportGenerator();
        this.excelGenerator = new excel_report_generator_1.ExcelReportGenerator();
        this.pptGenerator = new ppt_report_generator_1.PptReportGenerator();
    }
    async execute(dto, requestedBy) {
        const jobId = `JOB-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const determinedReportType = dto.reportType ||
            (dto.format === 'EXCEL'
                ? 'RAW_RESPONSES_XLSX'
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
        // Asynchronous background worker report compilation (FR-RPT-001)
        setTimeout(async () => {
            try {
                job.status = 'PROCESSING';
                await this.reportJobRepo.save(job);
                const scopeType = dto.scopeType || (dto.nodeId ? 'DEPARTMENT' : 'ORGANIZATION');
                const scopeFilter = dto.scopeFilter || (dto.nodeId ? { nodeId: dto.nodeId } : undefined);
                const title = dto.title || `Enterprise Survey Report (${scopeType})`;
                let result;
                if (dto.format === 'EXCEL') {
                    result = await this.excelGenerator.generateExcel({
                        reportId: jobId,
                        projectId: dto.projectId,
                        campaignId: dto.campaignId,
                        title,
                        scopeType,
                        scopeFilter,
                        includeAiSentimentSummary: dto.includeAiSentimentSummary ?? true,
                        includeBenchmarkComparison: dto.includeBenchmarkComparison ?? true,
                        requestedBy,
                    });
                }
                else if (dto.format === 'POWERPOINT') {
                    result = await this.pptGenerator.generatePpt({
                        reportId: jobId,
                        projectId: dto.projectId,
                        campaignId: dto.campaignId,
                        title,
                        scopeType,
                        scopeFilter,
                        requestedBy,
                    });
                }
                else if (dto.format === 'PDF' || determinedReportType === 'EXEC_SUMMARY_PDF' || determinedReportType === 'DEPT_BREAKDOWN_PDF') {
                    result = await this.pdfGenerator.generatePdf({
                        reportId: jobId,
                        projectId: dto.projectId,
                        campaignId: dto.campaignId,
                        title,
                        scopeType,
                        scopeFilter,
                        includeAiSentimentSummary: dto.includeAiSentimentSummary ?? true,
                        includeBenchmarkComparison: dto.includeBenchmarkComparison ?? true,
                        passwordProtected: dto.passwordProtected ?? (!!dto.pdfPassword),
                        pdfPassword: dto.pdfPassword,
                        requestedBy,
                    });
                }
                else {
                    result = await this.csvGenerator.generateReport({
                        projectId: dto.projectId,
                        campaignId: dto.campaignId,
                        reportId: jobId,
                        reportType: determinedReportType,
                        nodeId: dto.nodeId,
                        requestedBy,
                    });
                }
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                job.completeJob(result.downloadUrl, expiresAt, result.fileSizeBytes);
                await this.reportJobRepo.save(job);
                // Emit ReportGeneratedEvent (FR-RPT-008)
                new report_generated_event_1.ReportGeneratedEvent({
                    projectId: dto.projectId,
                    campaignId: dto.campaignId,
                    jobId,
                    reportType: determinedReportType,
                    downloadUrl: result.downloadUrl,
                    expiresAt: expiresAt.toISOString(),
                });
            }
            catch (err) {
                job.failJob(err.message || 'Report generation failed');
                await this.reportJobRepo.save(job);
            }
        }, 50);
        return {
            jobId,
            status: 'QUEUED',
            estimatedDurationSeconds: 3,
        };
    }
}
exports.RequestReportGenerationUseCase = RequestReportGenerationUseCase;
//# sourceMappingURL=request-report-generation.use-case.js.map