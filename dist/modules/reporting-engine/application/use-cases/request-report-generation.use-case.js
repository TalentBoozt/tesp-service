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
            (dto.format === 'PROMPT'
                ? 'AGENTIC_PROMPT_PACK'
                : dto.format === 'POWERPOINT'
                    ? 'BOARDROOM_DECK_POWERPOINT'
                    : dto.format === 'EXCEL'
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
        let branding;
        let benchmark;
        if (this.projectRepo) {
            try {
                const project = await this.projectRepo.findByProjectId(dto.projectId);
                if (project) {
                    if (project.branding) {
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