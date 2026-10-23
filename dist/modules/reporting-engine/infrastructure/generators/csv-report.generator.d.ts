export interface GenerateReportOptions {
    projectId: string;
    campaignId: string;
    reportId: string;
    reportType: string;
    nodeId?: string;
    requestedBy?: string;
}
export interface GeneratedReportResult {
    filePath: string;
    fileName: string;
    fileSizeBytes: number;
    downloadUrl: string;
}
export declare class CsvReportGenerator {
    generateReport(options: GenerateReportOptions): Promise<GeneratedReportResult>;
    private createMinimalValidPdf;
    private escapePdfText;
}
