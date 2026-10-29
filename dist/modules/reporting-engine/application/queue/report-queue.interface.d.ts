import { ReportType } from '../../domain/entities/report-job.entity';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
import { ReportBrandingOptions } from '../../infrastructure/generators/pdf-report.generator';
export interface ReportJobPayload {
    jobId: string;
    projectId: string;
    campaignId: string;
    reportType: ReportType;
    format?: 'PDF' | 'EXCEL' | 'POWERPOINT' | 'CSV' | 'WEB';
    nodeId?: string;
    scopeType?: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    title?: string;
    includeAiSentimentSummary?: boolean;
    includeBenchmarkComparison?: boolean;
    passwordProtected?: boolean;
    pdfPassword?: string;
    requestedBy: string;
    branding?: ReportBrandingOptions;
    benchmark?: number | null;
    bypassPrivacy?: boolean;
    attempts?: number;
    maxAttempts?: number;
    enqueuedAt?: Date;
}
export interface IReportJobQueue {
    enqueue(job: ReportJobPayload): Promise<void>;
    dequeue(): Promise<ReportJobPayload | null>;
    getQueueLength(): Promise<number>;
    clear(): Promise<void>;
}
