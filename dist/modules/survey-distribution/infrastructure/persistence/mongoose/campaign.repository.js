"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyCampaignMongoRepository = void 0;
const campaign_entity_1 = require("../../../domain/entities/campaign.entity");
const campaign_schema_1 = require("./campaign.schema");
class SurveyCampaignMongoRepository {
    toEntity(doc) {
        return new campaign_entity_1.CampaignEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            surveyId: doc.surveyId,
            surveyVersion: doc.surveyVersion,
            title: doc.title,
            anonymityLevel: doc.anonymityLevel,
            channels: doc.channels,
            targetAudience: doc.targetAudience,
            schedule: doc.schedule,
            metrics: doc.metrics,
            status: doc.status,
            startDate: doc.startDate,
            expirationDate: doc.expirationDate,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async save(campaign) {
        const raw = campaign.toJSON();
        const doc = await campaign_schema_1.CampaignModel.findOneAndUpdate({ projectId: campaign.projectId, campaignId: campaign.campaignId }, {
            $set: {
                surveyId: raw.surveyId,
                surveyVersion: raw.surveyVersion,
                title: raw.title,
                anonymityLevel: raw.anonymityLevel,
                channels: raw.channels,
                targetAudience: raw.targetAudience,
                schedule: raw.schedule,
                metrics: raw.metrics,
                status: raw.status,
                startDate: raw.startDate,
                expirationDate: raw.expirationDate,
                isDeleted: raw.isDeleted,
                updatedAt: raw.updatedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                campaignId: raw.campaignId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByCampaignId(projectId, campaignId) {
        const doc = await campaign_schema_1.CampaignModel.findOne({
            projectId,
            campaignId,
            isDeleted: false,
        });
        if (!doc)
            return null;
        const entity = this.toEntity(doc);
        entity.checkExpiration();
        if (entity.status === campaign_entity_1.CampaignStatus.EXPIRED && doc.status !== campaign_entity_1.CampaignStatus.EXPIRED) {
            await this.save(entity);
        }
        return entity;
    }
    async findAll(projectId, options) {
        const query = { projectId, isDeleted: false };
        if (options?.status) {
            query.status = options.status;
        }
        const docs = await campaign_schema_1.CampaignModel.find(query).sort({ createdAt: -1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async incrementMetrics(projectId, campaignId, field, count = 1) {
        const updateQuery = {
            $inc: { [`metrics.${field}`]: count },
            $set: { updatedAt: new Date() },
        };
        const res = await campaign_schema_1.CampaignModel.updateOne({ projectId, campaignId, isDeleted: false }, updateQuery);
        return res.modifiedCount > 0;
    }
    async softDelete(projectId, campaignId) {
        const res = await campaign_schema_1.CampaignModel.updateOne({ projectId, campaignId, isDeleted: false }, { $set: { isDeleted: true, status: campaign_entity_1.CampaignStatus.CANCELLED, updatedAt: new Date() } });
        return res.modifiedCount > 0;
    }
}
exports.SurveyCampaignMongoRepository = SurveyCampaignMongoRepository;
//# sourceMappingURL=campaign.repository.js.map