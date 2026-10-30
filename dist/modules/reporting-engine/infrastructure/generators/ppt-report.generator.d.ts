import { ScopedMetricSummary } from '../services/scoped-data-aggregator.service';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface ReportBrandingOptions {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    organizationName?: string;
    consultantFirmName?: string;
}
export interface GeneratePptOptions {
    reportId: string;
    projectId: string;
    campaignId: string;
    title: string;
    scopeType: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    requestedBy?: string;
    branding?: ReportBrandingOptions;
    benchmark?: number | null;
    bypassPrivacy?: boolean;
}
export interface GeneratedPptResult {
    filePath: string;
    fileName: string;
    fileSizeBytes: number;
    downloadUrl: string;
    metrics: ScopedMetricSummary;
}
export declare class PptReportGenerator {
    private aggregator;
    private storageService;
    private sanitizeHexColor;
    generatePpt(options: GeneratePptOptions): Promise<GeneratedPptResult>;
}
