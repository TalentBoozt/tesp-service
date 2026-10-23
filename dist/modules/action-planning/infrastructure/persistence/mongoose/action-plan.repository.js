"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPlanMongoRepository = void 0;
const action_plan_entity_1 = require("../../../domain/entities/action-plan.entity");
const action_plan_schema_1 = require("./action-plan.schema");
class ActionPlanMongoRepository {
    toEntity(doc) {
        return new action_plan_entity_1.ActionPlanEntity({
            projectId: doc.projectId,
            actionPlanId: doc.actionPlanId,
            campaignId: doc.campaignId,
            nodeId: doc.nodeId,
            groupId: doc.groupId,
            title: doc.title,
            description: doc.description,
            status: doc.status,
            assigneeId: doc.assigneeId,
            approverId: doc.approverId,
            baselineScore: doc.baselineScore,
            targetScore: doc.targetScore,
            postActionScore: doc.postActionScore,
            targetCompletionDate: doc.targetCompletionDate,
            milestones: (doc.milestones || []).map((m) => ({
                milestoneId: m.milestoneId || m._id?.toString() || m.id,
                title: m.title,
                status: m.status,
                dueDate: m.dueDate,
                completed: m.completed !== undefined ? Boolean(m.completed) : m.status === 'COMPLETED',
            })),
            externalSync: doc.externalSync ? (doc.externalSync.toObject ? doc.externalSync.toObject() : doc.externalSync) : undefined,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async save(actionPlan) {
        const raw = actionPlan.toJSON();
        const doc = await action_plan_schema_1.ActionPlanModel.findOneAndUpdate({ projectId: raw.projectId, actionPlanId: raw.actionPlanId }, {
            $set: {
                campaignId: raw.campaignId,
                nodeId: raw.nodeId,
                groupId: raw.groupId,
                title: raw.title,
                description: raw.description,
                status: raw.status,
                assigneeId: raw.assigneeId,
                approverId: raw.approverId,
                baselineScore: raw.baselineScore,
                targetScore: raw.targetScore,
                postActionScore: raw.postActionScore,
                targetCompletionDate: raw.targetCompletionDate,
                milestones: raw.milestones,
                externalSync: raw.externalSync,
                isDeleted: raw.isDeleted,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                actionPlanId: raw.actionPlanId,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByActionPlanId(projectId, actionPlanId) {
        const doc = await action_plan_schema_1.ActionPlanModel.findOne({ projectId, actionPlanId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAllByNode(projectId, nodeId, status) {
        const query = { projectId, isDeleted: false };
        if (nodeId && nodeId !== 'GLOBAL')
            query.nodeId = nodeId;
        if (status)
            query.status = status;
        const docs = await action_plan_schema_1.ActionPlanModel.find(query).sort({ updatedAt: -1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async delete(projectId, actionPlanId) {
        const res = await action_plan_schema_1.ActionPlanModel.updateOne({ projectId, actionPlanId, isDeleted: false }, { $set: { isDeleted: true } });
        return res.modifiedCount > 0;
    }
    async updateMilestone(projectId, actionPlanId, milestoneId, completed) {
        const status = completed ? 'COMPLETED' : 'PENDING';
        let doc = await action_plan_schema_1.ActionPlanModel.findOneAndUpdate({
            projectId,
            actionPlanId,
            isDeleted: false,
            'milestones.milestoneId': milestoneId,
        }, {
            $set: {
                'milestones.$.status': status,
                'milestones.$.completed': completed,
                updatedAt: new Date(),
            },
        }, { new: true });
        if (!doc) {
            const plan = await action_plan_schema_1.ActionPlanModel.findOne({ projectId, actionPlanId, isDeleted: false });
            if (plan && plan.milestones) {
                const found = plan.milestones.find((m) => m.milestoneId === milestoneId ||
                    m._id?.toString() === milestoneId ||
                    m.id === milestoneId);
                if (found) {
                    found.completed = completed;
                    found.status = status;
                    plan.updatedAt = new Date();
                    await plan.save();
                    return this.toEntity(plan);
                }
            }
            return null;
        }
        return this.toEntity(doc);
    }
}
exports.ActionPlanMongoRepository = ActionPlanMongoRepository;
//# sourceMappingURL=action-plan.repository.js.map