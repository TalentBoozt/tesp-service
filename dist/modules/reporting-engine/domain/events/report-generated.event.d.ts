import { ReportType } from '../entities/report-job.entity';
import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
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
export declare class ReportGeneratedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "REPORT_GENERATED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: ReportGeneratedEventPayload;
    constructor(payload: Omit<ReportGeneratedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
