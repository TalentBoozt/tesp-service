import { ScopedMetricSummary } from '../services/scoped-data-aggregator.service';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface ReportBrandingOptions {
    primaryColor?: string;
    logoUrl?: string;
    organizationName?: string;
}
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
    branding?: ReportBrandingOptions;
    benchmark?: number | null;
    bypassPrivacy?: boolean;
}
export declare function sanitizeHexColor(color?: string, fallback?: string): string;
export interface GeneratedPdfResult {
    filePath?: string;
    fileName: string;
    fileSizeBytes: number;
    downloadUrl: string;
    metrics: ScopedMetricSummary;
    pdfBuffer: Buffer;
}
export declare class PdfReportGenerator {
    private aggregator;
    private storageService;
    generatePdfBuffer(options: GeneratePdfOptions): Promise<Buffer>;
    generatePdf(options: GeneratePdfOptions): Promise<GeneratedPdfResult>;
    private renderPdfBuffer;
}
