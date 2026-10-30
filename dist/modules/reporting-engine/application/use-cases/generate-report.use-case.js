"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateReportUseCase = void 0;
const pdf_report_generator_1 = require("../../infrastructure/generators/pdf-report.generator");
const excel_report_generator_1 = require("../../infrastructure/generators/excel-report.generator");
const ppt_report_generator_1 = require("../../infrastructure/generators/ppt-report.generator");
const prompt_report_generator_1 = require("../../infrastructure/generators/prompt-report.generator");
class GenerateReportUseCase {
    projectRepo;
    pdfGenerator;
    excelGenerator;
    pptGenerator;
    promptGenerator;
    constructor(projectRepo, pdfGenerator = new pdf_report_generator_1.PdfReportGenerator(), excelGenerator = new excel_report_generator_1.ExcelReportGenerator(), pptGenerator = new ppt_report_generator_1.PptReportGenerator(), promptGenerator = new prompt_report_generator_1.PromptReportGenerator()) {
        this.projectRepo = projectRepo;
        this.pdfGenerator = pdfGenerator;
        this.excelGenerator = excelGenerator;
        this.pptGenerator = pptGenerator;
        this.promptGenerator = promptGenerator;
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
                        let consultantFirmName = project.consultantFirmName;
                        if (!consultantFirmName && project.consultantFirmId) {
                            try {
                                const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
                                if (mongoose.default?.connection?.readyState === 1) {
                                    const { ConsultingFirmModel } = await Promise.resolve().then(() => __importStar(require('../../../consultant/infrastructure/persistence/mongoose/consulting-firm.schema')));
                                    const firm = await ConsultingFirmModel.findOne({ firmId: project.consultantFirmId }).lean();
                                    if (firm) {
                                        consultantFirmName = firm.name;
                                    }
                                }
                            }
                            catch {
                                // ignore
                            }
                        }
                        if (!consultantFirmName && project.tenantName) {
                            consultantFirmName = project.tenantName;
                        }
                        if (!consultantFirmName) {
                            consultantFirmName = 'Talnova Strategic Human Capital Advisory';
                        }
                        branding = {
                            primaryColor: project.branding.primaryColor,
                            secondaryColor: project.branding.secondaryColor,
                            logoUrl: project.branding.logoUrl,
                            organizationName: project.branding.companyName || project.name,
                            consultantFirmName,
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
        if (input.format === 'PROMPT' ||
            input.reportType?.includes('PROMPT') ||
            input.reportType?.includes('AGENTIC')) {
            const promptOptions = {
                reportId,
                projectId: input.projectId,
                campaignId: input.campaignId,
                title,
                scopeType,
                scopeFilter: input.scopeFilter,
                requestedBy: input.requestedBy,
                branding,
                benchmark,
                bypassPrivacy: input.bypassPrivacy,
                includeAiSentimentSummary: input.includeAiSentimentSummary ?? true,
                includeBenchmarkComparison: input.includeBenchmarkComparison ?? true,
            };
            return this.promptGenerator.generatePrompt(promptOptions);
        }
        if (input.format === 'POWERPOINT' ||
            input.reportType === 'BOARDROOM_DECK_POWERPOINT' ||
            input.reportType?.includes('POWERPOINT') ||
            input.reportType?.includes('PPT')) {
            const pptOptions = {
                reportId,
                projectId: input.projectId,
                campaignId: input.campaignId,
                title,
                scopeType,
                scopeFilter: input.scopeFilter,
                requestedBy: input.requestedBy,
                branding,
                benchmark,
                bypassPrivacy: input.bypassPrivacy,
            };
            return this.pptGenerator.generatePpt(pptOptions);
        }
        if (input.format === 'EXCEL' ||
            input.reportType === 'RAW_RESPONSES_XLSX' ||
            input.reportType === 'AGGREGATED_SCORES_XLSX' ||
            input.reportType?.includes('XLSX') ||
            input.reportType?.includes('EXCEL')) {
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
                bypassPrivacy: input.bypassPrivacy,
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
            bypassPrivacy: input.bypassPrivacy,
        };
        return this.pdfGenerator.generatePdf(pdfOptions);
    }
}
exports.GenerateReportUseCase = GenerateReportUseCase;
//# sourceMappingURL=generate-report.use-case.js.map