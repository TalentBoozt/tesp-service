import { ReportType } from '../entities/report-job.entity';
export interface ReportGeneratedEventPayload {
    eventId: string;
    eventType: 'REPORT_GENERATED';
    projectId: string;
    campaignId: string;
    jobId: string;
    reportType: ReportType;
    downloadUrl: string;
    expiresAt: string;
    timestamp: string;
}
export declare class ReportGeneratedEvent {
    readonly payload: ReportGeneratedEventPayload;
    constructor(payload: Omit<ReportGeneratedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
