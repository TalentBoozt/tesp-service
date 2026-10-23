import { ScopedMetricSummary } from '../services/scoped-data-aggregator.service';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface GeneratePptOptions {
    reportId: string;
    projectId: string;
    campaignId: string;
    title: string;
    scopeType: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    requestedBy?: string;
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
    generatePpt(options: GeneratePptOptions): Promise<GeneratedPptResult>;
    private buildBoardroomSlideDeck;
}
