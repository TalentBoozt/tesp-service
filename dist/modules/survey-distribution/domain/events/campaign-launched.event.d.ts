import { AnonymityLevel } from '../entities/campaign.entity';
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
export declare class CampaignLaunchedEvent {
    readonly payload: CampaignLaunchedEventPayload;
    constructor(payload: Omit<CampaignLaunchedEventPayload, 'eventId' | 'eventType' | 'timestamp'>);
}
