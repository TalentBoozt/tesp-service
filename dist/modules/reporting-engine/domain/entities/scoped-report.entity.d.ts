export type ReportScopeType = 'ORGANIZATION' | 'DEPARTMENT' | 'DEMOGRAPHIC_SEGMENT' | 'BUSINESS_UNIT';
export type ReportVisualFormat = 'PDF' | 'EXCEL' | 'POWERPOINT' | 'WEB';
export interface IReportScopeFilter {
    nodeId?: string;
    nodeName?: string;
    demographicKey?: string;
    demographicValue?: string;
    matrixTeamId?: string;
}
export interface IScopedReportProps {
    reportId: string;
    projectId: string;
    campaignId: string;
    surveyId?: string;
    title: string;
    scopeType: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    format: ReportVisualFormat;
    includeAiSentimentSummary?: boolean;
    includeBenchmarkComparison?: boolean;
    passwordProtected?: boolean;
    pdfPassword?: string;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    downloadUrl?: string;
    fileSizeBytes?: number;
    sampleSize?: number;
    isSuppressed?: boolean;
    suppressionNotice?: string;
    requestedBy: string;
    createdAt?: Date;
    completedAt?: Date;
}
export declare class ScopedReportEntity {
    static REPORT_ID_REGEX: RegExp;
    readonly reportId: string;
    readonly projectId: string;
    readonly campaignId: string;
    readonly surveyId?: string;
    readonly title: string;
    readonly scopeType: ReportScopeType;
    readonly scopeFilter?: IReportScopeFilter;
    readonly format: ReportVisualFormat;
    readonly includeAiSentimentSummary: boolean;
    readonly includeBenchmarkComparison: boolean;
    readonly passwordProtected: boolean;
    readonly pdfPassword?: string;
    private _status;
    private _downloadUrl?;
    private _fileSizeBytes?;
    private _sampleSize?;
    private _isSuppressed;
    private _suppressionNotice?;
    readonly requestedBy: string;
    readonly createdAt: Date;
    private _completedAt?;
    constructor(props: IScopedReportProps);
    get status(): 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    get downloadUrl(): string | undefined;
    get fileSizeBytes(): number | undefined;
    get sampleSize(): number | undefined;
    get isSuppressed(): boolean;
    get suppressionNotice(): string | undefined;
    get completedAt(): Date | undefined;
    complete(downloadUrl: string, fileSizeBytes?: number, sampleSize?: number, isSuppressed?: boolean, suppressionNotice?: string): void;
    fail(reason: string): void;
    toJSON(): IScopedReportProps;
}
