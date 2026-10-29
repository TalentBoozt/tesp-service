"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateReportUseCase = void 0;
const pdf_report_generator_1 = require("../../infrastructure/generators/pdf-report.generator");
const excel_report_generator_1 = require("../../infrastructure/generators/excel-report.generator");
class GenerateReportUseCase {
    projectRepo;
    pdfGenerator;
    excelGenerator;
    constructor(projectRepo, pdfGenerator = new pdf_report_generator_1.PdfReportGenerator(), excelGenerator = new excel_report_generator_1.ExcelReportGenerator()) {
        this.projectRepo = projectRepo;
        this.pdfGenerator = pdfGenerator;
        this.excelGenerator = excelGenerator;
    }
    async execute(input) {
        const reportId = input.reportId || `RPT-${Math.floor(100000 + Math.random() * 900000)}`;
        const scopeType = input.scopeType || (input.scopeFilter?.nodeId ? 'DEPARTMENT' : 'ORGANIZATION');
        const title = input.title || `Enterprise Survey Executive Report (${scopeType})`;
        let branding = input.branding;
        let benchmark = input.benchmark;
        if (this.projectRepo && (!branding || benchmark === undefined)) {
            try {
                const project = await this.projectRepo.findByProjectId(input.projectId);
                if (project) {
                    if (!branding && project.branding) {
                        branding = {
                            primaryColor: project.branding.primaryColor,
                            logoUrl: project.branding.logoUrl,
                            organizationName: project.branding.companyName || project.name,
                        };
                    }
                    if (benchmark === undefined && project.benchmarkSettings) {
                        benchmark = project.benchmarkSettings.overallScoreBenchmark ?? null;
                    }
                }
            }
            catch {
                // Fall back gracefully if project lookup fails
            }
        }
        if (input.format === 'EXCEL' || input.reportType?.includes('XLSX') || input.reportType?.includes('EXCEL')) {
            const excelOptions = {
                reportId,
                projectId: input.projectId,
                campaignId: input.campaignId,
                title,
                scopeType,
                scopeFilter: input.scopeFilter,
                includeAiSentimentSummary: input.includeAiSentimentSummary ?? true,
                includeBenchmarkComparison: input.includeBenchmarkComparison ?? true,
                requestedBy: input.requestedBy,
                branding,
                benchmark,
            };
            return this.excelGenerator.generateExcel(excelOptions);
        }
        const pdfOptions = {
            reportId,
            projectId: input.projectId,
            campaignId: input.campaignId,
            title,
            scopeType,
            scopeFilter: input.scopeFilter,
            includeAiSentimentSummary: input.includeAiSentimentSummary ?? true,
            includeBenchmarkComparison: input.includeBenchmarkComparison ?? true,
            passwordProtected: input.passwordProtected ?? !!input.pdfPassword,
            pdfPassword: input.pdfPassword,
            requestedBy: input.requestedBy,
            branding,
            benchmark,
        };
        return this.pdfGenerator.generatePdf(pdfOptions);
    }
}
exports.GenerateReportUseCase = GenerateReportUseCase;
//# sourceMappingURL=generate-report.use-case.js.map