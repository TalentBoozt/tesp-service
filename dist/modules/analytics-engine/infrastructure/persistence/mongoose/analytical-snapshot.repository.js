"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticalSnapshotMongoRepository = void 0;
const analytical_snapshot_entity_1 = require("../../../domain/entities/analytical-snapshot.entity");
const analytical_snapshot_schema_1 = require("./analytical-snapshot.schema");
class AnalyticalSnapshotMongoRepository {
    toEntity(doc) {
        return new analytical_snapshot_entity_1.AnalyticalSnapshotEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            surveyId: doc.surveyId,
            snapshotId: doc.snapshotId,
            snapshotDate: doc.snapshotDate,
            totalResponses: doc.totalResponses,
            overallEnps: doc.overallEnps,
            overallEngagementIndex: doc.overallEngagementIndex,
            participationRate: doc.participationRate,
            groupScores: doc.groupScores,
            nodeAggregates: doc.nodeAggregates,
            createdAt: doc.createdAt,
        });
    }
    async save(snapshot) {
        const raw = snapshot.toJSON();
        const doc = await analytical_snapshot_schema_1.AnalyticalSnapshotModel.findOneAndUpdate({ projectId: raw.projectId, snapshotId: raw.snapshotId }, {
            $set: {
                campaignId: raw.campaignId,
                surveyId: raw.surveyId,
                snapshotDate: raw.snapshotDate,
                totalResponses: raw.totalResponses,
                overallEnps: raw.overallEnps,
                overallEngagementIndex: raw.overallEngagementIndex,
                participationRate: raw.participationRate,
                groupScores: raw.groupScores,
                nodeAggregates: raw.nodeAggregates,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                snapshotId: raw.snapshotId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByCampaignId(projectId, campaignId) {
        const doc = await analytical_snapshot_schema_1.AnalyticalSnapshotModel.findOne({ projectId, campaignId }).sort({ snapshotDate: -1 });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findLatestBaseline(projectId, currentCampaignId) {
        const doc = await analytical_snapshot_schema_1.AnalyticalSnapshotModel.findOne({
            projectId,
            campaignId: { $ne: currentCampaignId },
        }).sort({ snapshotDate: -1 });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
}
exports.AnalyticalSnapshotMongoRepository = AnalyticalSnapshotMongoRepository;
//# sourceMappingURL=analytical-snapshot.repository.js.map