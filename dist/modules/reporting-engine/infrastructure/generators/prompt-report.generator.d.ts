import { ScopedMetricSummary } from '../services/scoped-data-aggregator.service';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface ReportBrandingOptions {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    organizationName?: string;
    consultantFirmName?: string;
}
export interface GeneratePromptOptions {
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
    includeAiSentimentSummary?: boolean;
    includeBenchmarkComparison?: boolean;
}
export interface GeneratedPromptResult {
    filePath: string;
    fileName: string;
    fileSizeBytes: number;
    downloadUrl: string;
    promptContent: string;
    metrics: ScopedMetricSummary;
}
export declare class PromptReportGenerator {
    private aggregator;
    private storageService;
    generatePrompt(options: GeneratePromptOptions): Promise<GeneratedPromptResult>;
}
