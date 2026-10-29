import { AnonymityLevel } from '../entities/campaign.entity';
import { IDomainEvent } from '../../../../shared/domain/events/event-bus';
export interface CampaignLaunchedEventPayload {
    eventId: string;
    eventType: 'CAMPAIGN_LAUNCHED';
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    totalTargeted: number;
    anonymityLevel: AnonymityLevel;
    timestamp: string;
}
export declare class CampaignLaunchedEvent implements IDomainEvent {
    readonly eventId: string;
    readonly eventType = "CAMPAIGN_LAUNCHED";
    readonly aggregateId: string;
    readonly timestamp: Date;
    readonly payload: CampaignLaunchedEventPayload;
    constructor(payload: Omit<CampaignLaunchedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
