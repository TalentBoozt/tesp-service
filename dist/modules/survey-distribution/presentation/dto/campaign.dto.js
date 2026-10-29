"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookPayloadDtoSchema = exports.LaunchCampaignDtoSchema = void 0;
const zod_1 = require("zod");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
exports.LaunchCampaignDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z
        .string()
        .regex(/^CMP-[A-Za-z0-9_-]{3,50}$/, 'Invalid Campaign ID format. Must match ^CMP-[A-Za-z0-9_-]{3,50}$'),
    surveyId: zod_1.z.string().min(1, 'surveyId is required'),
    surveyVersion: zod_1.z.number().int().positive('surveyVersion must be a positive integer'),
    title: zod_1.z.string().min(1, 'title is required'),
    anonymityLevel: zod_1.z.nativeEnum(campaign_entity_1.AnonymityLevel).default(campaign_entity_1.AnonymityLevel.FULLY_ANONYMOUS),
    channels: zod_1.z
        .array(zod_1.z.preprocess((val) => (val === 'PIN_KIOSK' ? campaign_entity_1.DistributionChannel.KIOSK_PIN : val), zod_1.z.nativeEnum(campaign_entity_1.DistributionChannel)))
        .min(1, 'At least one channel required'),
    targetAudience: zod_1.z
        .object({
        nodeIds: zod_1.z.array(zod_1.z.string()).optional(),
        demographicFilters: zod_1.z.record(zod_1.z.any()).optional(),
    })
        .optional(),
    schedule: zod_1.z
        .object({
        reminderDates: zod_1.z.array(zod_1.z.string()).optional(),
        reminderFrequencyDays: zod_1.z.number().optional(),
    })
        .optional(),
    startDate: zod_1.z.string().datetime({ message: 'startDate must be a valid ISO date string' }),
    expirationDate: zod_1.z.string().datetime({ message: 'expirationDate must be a valid ISO date string' }),
    targetEmployeesCount: zod_1.z.number().int().optional(),
});
exports.WebhookPayloadDtoSchema = zod_1.z.object({
    provider: zod_1.z.enum(['AWS_SES', 'TWILIO']),
    eventType: zod_1.z.enum(['DELIVERED', 'OPENED', 'BOUNCED', 'FAILED']),
    projectId: zod_1.z.string().min(1),
    campaignId: zod_1.z.string().min(1),
    eventId: zod_1.z.string().optional(),
    messageId: zod_1.z.string().optional(),
    recipientEmail: zod_1.z.string().email().optional(),
    recipientPhone: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().optional(),
});
//# sourceMappingURL=campaign.dto.js.map