"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticalSnapshotEntity = void 0;
class AnalyticalSnapshotEntity {
    projectId;
    campaignId;
    surveyId;
    snapshotId;
    snapshotDate;
    totalResponses;
    overallEnps;
    overallEngagementIndex;
    participationRate;
    groupScores;
    nodeAggregates;
    createdAt;
    constructor(props) {
        if (!props.projectId || !props.campaignId || !props.surveyId) {
            throw new Error('projectId, campaignId, and surveyId are required');
        }
        this.validateSnapshotId(props.snapshotId);
        this.projectId = props.projectId;
        this.campaignId = props.campaignId;
        this.surveyId = props.surveyId;
        this.snapshotId = props.snapshotId;
        this.snapshotDate = props.snapshotDate || new Date();
        this.totalResponses = props.totalResponses;
        this.overallEnps = props.overallEnps;
        this.overallEngagementIndex = props.overallEngagementIndex;
        this.participationRate = props.participationRate ?? 0;
        this.groupScores = props.groupScores ? [...props.groupScores] : [];
        this.nodeAggregates = props.nodeAggregates ? [...props.nodeAggregates] : [];
        this.createdAt = props.createdAt || new Date();
    }
    validateSnapshotId(snapshotId) {
        const pattern = /^SNP-[A-Za-z0-9_-]{3,50}$/;
        if (!pattern.test(snapshotId)) {
            throw new Error(`Invalid Snapshot ID format: '${snapshotId}'. Must match pattern ^SNP-[A-Za-z0-9_-]{3,50}$`);
        }
    }
    toJSON() {
        return {
            projectId: this.projectId,
            campaignId: this.campaignId,
            surveyId: this.surveyId,
            snapshotId: this.snapshotId,
            snapshotDate: this.snapshotDate,
            totalResponses: this.totalResponses,
            overallEnps: this.overallEnps,
            overallEngagementIndex: this.overallEngagementIndex,
            participationRate: this.participationRate,
            groupScores: this.groupScores.map((g) => ({ ...g })),
            nodeAggregates: this.nodeAggregates.map((n) => ({ ...n })),
            createdAt: this.createdAt,
        };
    }
}
exports.AnalyticalSnapshotEntity = AnalyticalSnapshotEntity;
//# sourceMappingURL=analytical-snapshot.entity.js.map