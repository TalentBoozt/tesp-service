"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkplaceRiskSubscriber = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const action_plan_repository_1 = require("../../infrastructure/persistence/mongoose/action-plan.repository");
const action_plan_entity_1 = require("../../domain/entities/action-plan.entity");
class WorkplaceRiskSubscriber {
    actionPlanRepo;
    eventBus;
    static instance;
    isSubscribed = false;
    constructor(actionPlanRepo = new action_plan_repository_1.ActionPlanMongoRepository(), eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.actionPlanRepo = actionPlanRepo;
        this.eventBus = eventBus;
    }
    static getInstance(actionPlanRepo, eventBus) {
        if (!WorkplaceRiskSubscriber.instance) {
            WorkplaceRiskSubscriber.instance = new WorkplaceRiskSubscriber(actionPlanRepo, eventBus);
        }
        return WorkplaceRiskSubscriber.instance;
    }
    init() {
        if (this.isSubscribed)
            return;
        this.isSubscribed = true;
        this.eventBus.subscribe('WORKPLACE_RISK_ALERT', async (event) => {
            try {
                await this.handle(event);
            }
            catch (err) {
                console.error('[WorkplaceRiskSubscriber] Error handling WorkplaceRiskAlertEvent:', err);
            }
        });
    }
    async handle(event) {
        const payload = event.payload;
        if (!payload || !payload.projectId)
            return null;
        const actionPlanId = `ACT-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const category = payload.category || 'WORKPLACE_RISK';
        const severity = payload.severity || 'HIGH';
        const keyword = payload.keyword || 'REDACTED';
        const title = `[CONFIDENTIAL HR] Urgent Workplace Risk Investigation: ${category} (${severity})`;
        const description = `High-priority confidential action plan initiated in response to workplace risk alert (${category}, severity: ${severity}). Keyword detected: ${keyword}. Confidential HR investigation and compliance triage required.`;
        const milestones = [
            {
                milestoneId: 'MLS-1',
                title: 'Initiate confidential HR triage and intake assessment',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 2 * 86400000),
                completed: false,
            },
            {
                milestoneId: 'MLS-2',
                title: 'Conduct secure review of sanitized context and risk classification',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 4 * 86400000),
                completed: false,
            },
            {
                milestoneId: 'MLS-3',
                title: 'Implement protective measures and document formal resolution',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 7 * 86400000),
                completed: false,
            },
        ];
        const targetCompletionDate = new Date(Date.now() + 7 * 86400000);
        const actionPlan = new action_plan_entity_1.ActionPlanEntity({
            projectId: payload.projectId,
            actionPlanId,
            campaignId: payload.campaignId || 'CMP-RISK',
            nodeId: payload.nodeId || 'HR-COMPLIANCE',
            groupId: 'HR_COMPLIANCE',
            title,
            description,
            status: 'DRAFT',
            assigneeId: 'HR-COMPLIANCE-LEAD',
            baselineScore: 0,
            targetScore: 100,
            targetCompletionDate,
            milestones,
        });
        return await this.actionPlanRepo.save(actionPlan);
    }
}
exports.WorkplaceRiskSubscriber = WorkplaceRiskSubscriber;
//# sourceMappingURL=workplace-risk.subscriber.js.map