import { ScopedMetricSummary } from '../services/scoped-data-aggregator.service';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface GenerateExcelOptions {
    reportId: string;
    projectId: string;
    campaignId: string;
    title: string;
    scopeType: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    includeAiSentimentSummary?: boolean;
    includeBenchmarkComparison?: boolean;
    requestedBy?: string;
}
export interface GeneratedExcelResult {
    filePath: string;
    fileName: string;
    fileSizeBytes: number;
    downloadUrl: string;
    metrics: ScopedMetricSummary;
}
export declare class ExcelReportGenerator {
    private aggregator;
    generateExcel(options: GenerateExcelOptions): Promise<GeneratedExcelResult>;
    private escapeXml;
    private buildMultiTabWorkbook;
}
