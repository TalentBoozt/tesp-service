export declare enum AnonymityLevel {
    AUTHENTICATED = "AUTHENTICATED",
    SEMI_ANONYMOUS = "SEMI_ANONYMOUS",
    FULLY_ANONYMOUS = "FULLY_ANONYMOUS",
    KIOSK = "KIOSK"
}
export declare enum DistributionChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    QR_CODE = "QR_CODE",
    KIOSK_PIN = "KIOSK_PIN",
    TEAMS = "TEAMS",
    SLACK = "SLACK"
}
export declare enum CampaignStatus {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
    ARCHIVED = "ARCHIVED"
}
export interface TargetAudience {
    nodeIds?: string[];
    demographicFilters?: Record<string, any>;
}
export interface CampaignSchedule {
    reminderDates?: Date[];
    reminderFrequencyDays?: number;
}
export interface CampaignMetrics {
    totalTargeted: number;
    sent: number;
    delivered: number;
    opened: number;
    started: number;
    completed: number;
    bounced: number;
}
export interface CampaignProps {
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    title: string;
    anonymityLevel: AnonymityLevel;
    channels: DistributionChannel[];
    targetAudience?: TargetAudience;
    schedule?: CampaignSchedule;
    metrics?: CampaignMetrics;
    status: CampaignStatus;
    startDate: Date;
    expirationDate: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class CampaignEntity {
    readonly projectId: string;
    readonly campaignId: string;
    readonly surveyId: string;
    readonly surveyVersion: number;
    title: string;
    anonymityLevel: AnonymityLevel;
    channels: DistributionChannel[];
    targetAudience: TargetAudience;
    schedule: CampaignSchedule;
    metrics: CampaignMetrics;
    status: CampaignStatus;
    startDate: Date;
    expirationDate: Date;
    isDeleted: boolean;
    readonly createdAt: Date;
    updatedAt: Date;
    constructor(props: CampaignProps);
    private validateIdFormat;
    private validateDates;
    private validateChannels;
    launch(totalTargeted: number): void;
    pause(): void;
    resume(): void;
    cancel(): void;
    checkExpiration(now?: Date): void;
    incrementMetric(type: keyof CampaignMetrics, count?: number): void;
    toJSON(): CampaignProps;
}
