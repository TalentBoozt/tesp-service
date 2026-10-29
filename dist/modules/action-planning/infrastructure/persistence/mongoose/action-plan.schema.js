"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPlanModel = void 0;
const mongoose_1 = require("mongoose");
const ActionPlanSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    actionPlanId: { type: String, required: true, unique: true, index: true },
    campaignId: { type: String, required: true, index: true },
    nodeId: { type: String, required: true, index: true },
    groupId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['DRAFT', 'PROPOSED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'ACTIVE', 'COMPLETED', 'VERIFIED', 'CANCELLED'],
        default: 'DRAFT',
        required: true,
    },
    assigneeId: { type: String, required: true },
    approverId: { type: String },
    baselineScore: { type: Number, required: true },
    targetScore: { type: Number, required: true },
    postActionScore: { type: Number },
    targetCompletionDate: { type: Date, required: true },
    milestones: [
        {
            milestoneId: { type: String, required: true },
            title: { type: String, required: true },
            status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
            dueDate: { type: Date, required: true },
            completed: { type: Boolean, default: false },
            alertState: { type: String, enum: ['NONE', 'NUDGE_SENT', 'OVERDUE_ESCALATED'], default: 'NONE' },
        },
    ],
    externalSync: {
        system: { type: String, enum: ['NONE', 'JIRA', 'MS_PLANNER'], default: 'NONE' },
        externalKey: { type: String },
        externalTaskId: { type: String },
        externalUrl: { type: String },
        status: { type: String, enum: ['SYNCED', 'PENDING_CONFIG'], default: 'SYNCED' },
        lastSyncedAt: { type: Date },
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: 'action_plans',
});
ActionPlanSchema.index({ projectId: 1, nodeId: 1, status: 1 });
exports.ActionPlanModel = (0, mongoose_1.model)('ActionPlan', ActionPlanSchema);
//# sourceMappingURL=action-plan.schema.js.map