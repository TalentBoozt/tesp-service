"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticalSnapshotModel = void 0;
const mongoose_1 = require("mongoose");
const AnalyticalSnapshotSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    surveyId: { type: String, required: true },
    snapshotId: { type: String, required: true, unique: true, index: true },
    snapshotDate: { type: Date, required: true },
    totalResponses: { type: Number, required: true },
    overallEnps: { type: Number, required: true },
    overallEngagementIndex: { type: Number, required: true },
    participationRate: { type: Number, default: 0 },
    groupScores: [
        {
            groupId: { type: String, required: true },
            score: { type: Number, required: true },
        },
    ],
    nodeAggregates: [
        {
            nodeId: { type: String, required: true },
            nodePath: { type: String },
            responseCount: { type: Number, required: true },
            status: { type: String, enum: ['VALID', 'SUPPRESSED'], required: true },
            enps: { type: Number, default: null },
            engagementIndex: { type: Number, default: null },
        },
    ],
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'analytical_snapshots',
});
AnalyticalSnapshotSchema.index({ projectId: 1, campaignId: 1 });
AnalyticalSnapshotSchema.index({ projectId: 1, snapshotDate: -1 });
exports.AnalyticalSnapshotModel = (0, mongoose_1.model)('AnalyticalSnapshot', AnalyticalSnapshotSchema);
//# sourceMappingURL=analytical-snapshot.schema.js.map