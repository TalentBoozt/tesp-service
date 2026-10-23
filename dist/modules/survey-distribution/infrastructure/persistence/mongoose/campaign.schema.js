"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignModel = void 0;
const mongoose_1 = require("mongoose");
const campaign_entity_1 = require("../../../domain/entities/campaign.entity");
const CampaignSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, unique: true, index: true },
    surveyId: { type: String, required: true },
    surveyVersion: { type: Number, required: true },
    title: { type: String, required: true },
    anonymityLevel: {
        type: String,
        enum: Object.values(campaign_entity_1.AnonymityLevel),
        required: true,
    },
    channels: [
        {
            type: String,
            enum: Object.values(campaign_entity_1.DistributionChannel),
            required: true,
        },
    ],
    targetAudience: {
        nodeIds: [{ type: String }],
        demographicFilters: { type: mongoose_1.Schema.Types.Mixed },
    },
    schedule: {
        reminderDates: [{ type: Date }],
        reminderFrequencyDays: { type: Number },
    },
    metrics: {
        totalTargeted: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        started: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        bounced: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: Object.values(campaign_entity_1.CampaignStatus),
        default: campaign_entity_1.CampaignStatus.DRAFT,
        index: true,
    },
    startDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
    collection: 'survey_campaigns',
});
CampaignSchema.index({ projectId: 1, campaignId: 1 });
CampaignSchema.index({ projectId: 1, status: 1 });
exports.CampaignModel = (0, mongoose_1.model)('SurveyCampaign', CampaignSchema);
//# sourceMappingURL=campaign.schema.js.map