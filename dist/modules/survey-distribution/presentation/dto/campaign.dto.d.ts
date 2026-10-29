import { z } from 'zod';
import { AnonymityLevel, DistributionChannel } from '../../domain/entities/campaign.entity';
export declare const LaunchCampaignDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
    surveyId: z.ZodString;
    surveyVersion: z.ZodNumber;
    title: z.ZodString;
    anonymityLevel: z.ZodDefault<z.ZodNativeEnum<typeof AnonymityLevel>>;
    channels: z.ZodArray<z.ZodEffects<z.ZodNativeEnum<typeof DistributionChannel>, DistributionChannel, unknown>, "many">;
    targetAudience: z.ZodOptional<z.ZodObject<{
        nodeIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        demographicFilters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        nodeIds?: string[] | undefined;
        demographicFilters?: Record<string, any> | undefined;
    }, {
        nodeIds?: string[] | undefined;
        demographicFilters?: Record<string, any> | undefined;
    }>>;
    schedule: z.ZodOptional<z.ZodObject<{
        reminderDates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        reminderFrequencyDays: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        reminderDates?: string[] | undefined;
        reminderFrequencyDays?: number | undefined;
    }, {
        reminderDates?: string[] | undefined;
        reminderFrequencyDays?: number | undefined;
    }>>;
    startDate: z.ZodString;
    expirationDate: z.ZodString;
    targetEmployeesCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    surveyId: string;
    title: string;
    campaignId: string;
    surveyVersion: number;
    anonymityLevel: AnonymityLevel;
    channels: DistributionChannel[];
    startDate: string;
    expirationDate: string;
    targetAudience?: {
        nodeIds?: string[] | undefined;
        demographicFilters?: Record<string, any> | undefined;
    } | undefined;
    schedule?: {
        reminderDates?: string[] | undefined;
        reminderFrequencyDays?: number | undefined;
    } | undefined;
    targetEmployeesCount?: number | undefined;
}, {
    projectId: string;
    surveyId: string;
    title: string;
    campaignId: string;
    surveyVersion: number;
    channels: unknown[];
    startDate: string;
    expirationDate: string;
    anonymityLevel?: AnonymityLevel | undefined;
    targetAudience?: {
        nodeIds?: string[] | undefined;
        demographicFilters?: Record<string, any> | undefined;
    } | undefined;
    schedule?: {
        reminderDates?: string[] | undefined;
        reminderFrequencyDays?: number | undefined;
    } | undefined;
    targetEmployeesCount?: number | undefined;
}>;
export type LaunchCampaignDto = z.infer<typeof LaunchCampaignDtoSchema>;
export declare const WebhookPayloadDtoSchema: z.ZodObject<{
    provider: z.ZodEnum<["AWS_SES", "TWILIO"]>;
    eventType: z.ZodEnum<["DELIVERED", "OPENED", "BOUNCED", "FAILED"]>;
    projectId: z.ZodString;
    campaignId: z.ZodString;
    eventId: z.ZodOptional<z.ZodString>;
    messageId: z.ZodOptional<z.ZodString>;
    recipientEmail: z.ZodOptional<z.ZodString>;
    recipientPhone: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "AWS_SES" | "TWILIO";
    projectId: string;
    campaignId: string;
    eventType: "FAILED" | "DELIVERED" | "OPENED" | "BOUNCED";
    eventId?: string | undefined;
    timestamp?: string | undefined;
    messageId?: string | undefined;
    recipientEmail?: string | undefined;
    recipientPhone?: string | undefined;
}, {
    provider: "AWS_SES" | "TWILIO";
    projectId: string;
    campaignId: string;
    eventType: "FAILED" | "DELIVERED" | "OPENED" | "BOUNCED";
    eventId?: string | undefined;
    timestamp?: string | undefined;
    messageId?: string | undefined;
    recipientEmail?: string | undefined;
    recipientPhone?: string | undefined;
}>;
export type WebhookPayloadDto = z.infer<typeof WebhookPayloadDtoSchema>;
