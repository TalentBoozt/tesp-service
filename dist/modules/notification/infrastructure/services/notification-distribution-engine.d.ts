import { DomainEventBus, IDomainEvent } from '../../../../shared/domain/events/event-bus';
import { NotificationService } from './notification.service';
export declare class NotificationDistributionEngine {
    private service;
    private eventBus;
    private static instance;
    private isStarted;
    private processedEventIds;
    private readonly MAX_TRACKED_EVENTS;
    constructor(service?: NotificationService, eventBus?: DomainEventBus);
    static getInstance(): NotificationDistributionEngine;
    static resetInstance(): void;
    /**
     * Idempotently starts event subscribers for real-time notification distribution.
     */
    start(): void;
    private isDuplicate;
    onTenantProjectProvisioned(event: IDomainEvent): Promise<void>;
    onOrgNodeCreated(event: IDomainEvent): Promise<void>;
    onSurveyResponseSubmitted(event: IDomainEvent): Promise<void>;
    onCampaignLaunched(event: IDomainEvent): Promise<void>;
    onSurveyPublished(event: IDomainEvent): Promise<void>;
    onReportGenerated(event: IDomainEvent): Promise<void>;
    onWorkplaceRiskAlert(event: IDomainEvent): Promise<void>;
}
export declare const notificationDistributionEngine: NotificationDistributionEngine;
