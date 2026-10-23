import { ScopedMetricSummary } from '../services/scoped-data-aggregator.service';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface GeneratePdfOptions {
    reportId: string;
    projectId: string;
    campaignId: string;
    title: string;
    scopeType: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    includeAiSentimentSummary?: boolean;
    includeBenchmarkComparison?: boolean;
    passwordProtected?: boolean;
    pdfPassword?: string;
    requestedBy?: string;
}
export interface GeneratedPdfResult {
    filePath: string;
    fileName: string;
    fileSizeBytes: number;
    downloadUrl: string;
    metrics: ScopedMetricSummary;
}
export declare class PdfReportGenerator {
    private aggregator;
    private chartRenderer;
    generatePdf(options: GeneratePdfOptions): Promise<GeneratedPdfResult>;
    private buildExecutivePdf;
    private escapePdf;
    private escapeForPdfComment;
}
