"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPlanEntity = void 0;
class ActionPlanEntity {
    projectId;
    actionPlanId;
    campaignId;
    nodeId;
    groupId;
    title;
    description;
    status;
    assigneeId;
    approverId;
    baselineScore;
    targetScore;
    postActionScore;
    targetCompletionDate;
    milestones;
    externalSync;
    isDeleted;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.projectId || !props.campaignId || !props.nodeId || !props.groupId || !props.assigneeId) {
            throw new Error('projectId, campaignId, nodeId, groupId, and assigneeId are required');
        }
        this.validateActionPlanId(props.actionPlanId);
        this.projectId = props.projectId;
        this.actionPlanId = props.actionPlanId;
        this.campaignId = props.campaignId;
        this.nodeId = props.nodeId;
        this.groupId = props.groupId;
        this.title = props.title;
        this.description = props.description;
        this.status = props.status || 'DRAFT';
        this.assigneeId = props.assigneeId;
        this.approverId = props.approverId;
        this.baselineScore = props.baselineScore;
        this.targetScore = props.targetScore;
        this.postActionScore = props.postActionScore;
        this.targetCompletionDate = props.targetCompletionDate;
        this.milestones = props.milestones ? props.milestones.map((m) => ({ alertState: 'NONE', ...m })) : [];
        this.externalSync = props.externalSync ? { ...props.externalSync } : { system: 'NONE' };
        this.isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
    validateActionPlanId(actionPlanId) {
        const pattern = /^ACT-[A-Za-z0-9_-]{3,50}$/;
        if (!pattern.test(actionPlanId)) {
            throw new Error(`Invalid Action Plan ID format: '${actionPlanId}'. Must match pattern ^ACT-[A-Za-z0-9_-]{3,50}$`);
        }
    }
    toJSON() {
        return {
            projectId: this.projectId,
            actionPlanId: this.actionPlanId,
            campaignId: this.campaignId,
            nodeId: this.nodeId,
            groupId: this.groupId,
            title: this.title,
            description: this.description,
            status: this.status,
            assigneeId: this.assigneeId,
            approverId: this.approverId,
            baselineScore: this.baselineScore,
            targetScore: this.targetScore,
            postActionScore: this.postActionScore,
            targetCompletionDate: this.targetCompletionDate,
            milestones: this.milestones.map((m) => ({ ...m })),
            externalSync: { ...this.externalSync },
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.ActionPlanEntity = ActionPlanEntity;
//# sourceMappingURL=action-plan.entity.js.map