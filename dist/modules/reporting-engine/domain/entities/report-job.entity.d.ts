export type ReportType = 'EXEC_SUMMARY_PDF' | 'DEPT_BREAKDOWN_PDF' | 'RAW_RESPONSES_XLSX' | 'AGGREGATED_SCORES_XLSX' | 'BOARDROOM_DECK_POWERPOINT' | 'SCOPED_REPORT';
export type JobStatus = 'QUEUED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'READY' | 'FAILED';
export interface ReportJobProps {
    projectId: string;
    campaignId: string;
    jobId: string;
    reportType: ReportType;
    nodeId?: string;
    requestedBy: string;
    status?: JobStatus;
    downloadUrl?: string;
    expiresAt?: Date;
    errorMessage?: string;
    failureReason?: string;
    fileSizeBytes?: number;
    createdAt?: Date;
    completedAt?: Date;
}
export declare class ReportJobEntity {
    readonly projectId: string;
    readonly campaignId: string;
    readonly jobId: string;
    readonly reportType: ReportType;
    readonly nodeId?: string;
    readonly requestedBy: string;
    status: JobStatus;
    downloadUrl?: string;
    expiresAt?: Date;
    errorMessage?: string;
    fileSizeBytes?: number;
    readonly createdAt: Date;
    completedAt?: Date;
    constructor(props: ReportJobProps);
    private validateJobId;
    completeJob(downloadUrl: string, expiresAt: Date, fileSizeBytes?: number): void;
    get failureReason(): string | undefined;
    set failureReason(val: string | undefined);
    failJob(errorMessage: string): void;
    toJSON(): ReportJobProps;
}
