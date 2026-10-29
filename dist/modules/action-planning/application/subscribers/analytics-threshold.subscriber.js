"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsThresholdSubscriber = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const action_plan_repository_1 = require("../../infrastructure/persistence/mongoose/action-plan.repository");
const action_template_repository_1 = require("../../infrastructure/persistence/mongoose/action-template.repository");
const action_plan_entity_1 = require("../../domain/entities/action-plan.entity");
class AnalyticsThresholdSubscriber {
    actionPlanRepo;
    templateRepo;
    eventBus;
    static instance;
    isSubscribed = false;
    defaultThreshold;
    constructor(actionPlanRepo = new action_plan_repository_1.ActionPlanMongoRepository(), templateRepo, eventBus = event_bus_1.DomainEventBus.getInstance(), defaultThreshold = 60) {
        this.actionPlanRepo = actionPlanRepo;
        this.templateRepo = templateRepo;
        this.eventBus = eventBus;
        this.defaultThreshold = defaultThreshold;
        if (!this.templateRepo) {
            try {
                this.templateRepo = new action_template_repository_1.ActionTemplateMongoRepository();
            }
            catch {
                // Fallback for isolated unit tests
            }
        }
    }
    static getInstance(actionPlanRepo, templateRepo, eventBus) {
        if (!AnalyticsThresholdSubscriber.instance) {
            AnalyticsThresholdSubscriber.instance = new AnalyticsThresholdSubscriber(actionPlanRepo, templateRepo, eventBus);
        }
        return AnalyticsThresholdSubscriber.instance;
    }
    init() {
        if (this.isSubscribed)
            return;
        this.isSubscribed = true;
        this.eventBus.subscribe('ANALYTICAL_SNAPSHOT_CREATED', async (event) => {
            try {
                await this.handle(event);
            }
            catch (err) {
                console.error('[AnalyticsThresholdSubscriber] Error handling AnalyticalSnapshotCreatedEvent:', err);
            }
        });
    }
    async handle(event) {
        const payload = event.payload;
        if (!payload || !payload.projectId)
            return [];
        const threshold = this.defaultThreshold;
        const createdPlans = [];
        // 1. Check explicit departmentScores if provided in snapshot payload
        if (Array.isArray(payload.departmentScores) && payload.departmentScores.length > 0) {
            for (const dept of payload.departmentScores) {
                if (dept.score < threshold) {
                    const plan = await this.triggerPlanForNode(payload.projectId, payload.campaignId, dept.nodeId, dept.score, dept.departmentName);
                    if (plan)
                        createdPlans.push(plan);
                }
            }
            return createdPlans;
        }
        // 2. Check nodeAggregates if provided
        if (Array.isArray(payload.nodeAggregates) && payload.nodeAggregates.length > 0) {
            for (const node of payload.nodeAggregates) {
                if (node.status !== 'SUPPRESSED' &&
                    typeof node.engagementIndex === 'number' &&
                    node.engagementIndex < threshold) {
                    const plan = await this.triggerPlanForNode(payload.projectId, payload.campaignId, node.nodeId, node.engagementIndex, node.nodePath);
                    if (plan)
                        createdPlans.push(plan);
                }
            }
            return createdPlans;
        }
        // 3. Fallback to overallEngagementIndex if score < threshold
        if (typeof payload.overallEngagementIndex === 'number' &&
            payload.overallEngagementIndex < threshold) {
            const plan = await this.triggerPlanForNode(payload.projectId, payload.campaignId, 'ORGANIZATION_ROOT', payload.overallEngagementIndex, 'Entire Organization');
            if (plan)
                createdPlans.push(plan);
        }
        return createdPlans;
    }
    async triggerPlanForNode(projectId, campaignId, nodeId, score, departmentName) {
        // Check if active action plan already exists for this unit
        try {
            const existing = await this.actionPlanRepo.findAllByNode(projectId, nodeId);
            const activeStatuses = ['DRAFT', 'PROPOSED', 'APPROVED', 'IN_PROGRESS'];
            const hasActive = existing.some((p) => activeStatuses.includes(p.status) && !p.isDeleted);
            if (hasActive) {
                return null;
            }
        }
        catch (err) {
            // If repository lookup fails, continue cautiously
        }
        const title = `Targeted Intervention: Low Engagement in ${departmentName || nodeId}`;
        const actionPlanId = `ACT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        let milestones = [];
        if (this.templateRepo) {
            try {
                const templates = await this.templateRepo.findAll();
                if (templates.length > 0 && templates[0].suggestedMilestones?.length) {
                    milestones = templates[0].suggestedMilestones.map((m, idx) => ({
                        milestoneId: `MLS-${idx + 1}`,
                        title: m,
                        status: 'PENDING',
                        dueDate: new Date(Date.now() + (idx + 1) * 14 * 86400000),
                        completed: false,
                    }));
                }
            }
            catch {
                // Fall back to default milestones
            }
        }
        if (milestones.length === 0) {
            milestones = [
                {
                    milestoneId: 'MLS-1',
                    title: 'Conduct department engagement debrief with team leads',
                    status: 'PENDING',
                    dueDate: new Date(Date.now() + 14 * 86400000),
                    completed: false,
                },
                {
                    milestoneId: 'MLS-2',
                    title: 'Formulate and deploy targeted team remediation commitments',
                    status: 'PENDING',
                    dueDate: new Date(Date.now() + 30 * 86400000),
                    completed: false,
                },
                {
                    milestoneId: 'MLS-3',
                    title: 'Conduct 60-day pulse check against baseline score',
                    status: 'PENDING',
                    dueDate: new Date(Date.now() + 60 * 86400000),
                    completed: false,
                },
            ];
        }
        const targetScore = Math.min(100, Math.round(score + 15));
        const targetCompletionDate = new Date(Date.now() + 60 * 86400000);
        const actionPlan = new action_plan_entity_1.ActionPlanEntity({
            projectId,
            actionPlanId,
            campaignId: campaignId || 'CMP-DEFAULT',
            nodeId,
            groupId: 'ENGAGEMENT_REMEDIATION',
            title,
            description: `Automated action plan triggered due to low engagement score (${score}%) below threshold (${this.defaultThreshold}%).`,
            status: 'DRAFT',
            assigneeId: 'SYSTEM-AUTO',
            baselineScore: score,
            targetScore,
            targetCompletionDate,
            milestones,
        });
        return await this.actionPlanRepo.save(actionPlan);
    }
}
exports.AnalyticsThresholdSubscriber = AnalyticsThresholdSubscriber;
//# sourceMappingURL=analytics-threshold.subscriber.js.map