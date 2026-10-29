"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneEscalationWorker = void 0;
const action_plan_repository_1 = require("../../infrastructure/persistence/mongoose/action-plan.repository");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const milestone_nudge_event_1 = require("../../domain/events/milestone-nudge.event");
const milestone_overdue_escalation_event_1 = require("../../domain/events/milestone-overdue-escalation.event");
class MilestoneEscalationWorker {
    static instance;
    intervalTimer = null;
    isRunning = false;
    actionPlanRepo;
    eventBus;
    constructor(actionPlanRepo, eventBus) {
        this.actionPlanRepo = actionPlanRepo || new action_plan_repository_1.ActionPlanMongoRepository();
        this.eventBus = eventBus || event_bus_1.DomainEventBus.getInstance();
    }
    static getInstance(actionPlanRepo, eventBus) {
        if (!MilestoneEscalationWorker.instance) {
            MilestoneEscalationWorker.instance = new MilestoneEscalationWorker(actionPlanRepo, eventBus);
        }
        return MilestoneEscalationWorker.instance;
    }
    start(intervalMs = 60 * 60 * 1000) {
        if (this.intervalTimer)
            return;
        // Trigger initial check non-blockingly
        this.processMilestoneDeadlines().catch((err) => console.error('[MilestoneEscalationWorker] Error during initial deadline evaluation:', err));
        this.intervalTimer = setInterval(async () => {
            await this.processMilestoneDeadlines().catch((err) => console.error('[MilestoneEscalationWorker] Error during periodic deadline evaluation:', err));
        }, intervalMs);
        if (this.intervalTimer.unref) {
            this.intervalTimer.unref();
        }
        console.log(`[MilestoneEscalationWorker] Milestone escalation worker started (interval: ${intervalMs}ms)`);
    }
    stop() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
            console.log('[MilestoneEscalationWorker] Milestone escalation worker stopped');
        }
    }
    isStarted() {
        return this.intervalTimer !== null;
    }
    async processMilestoneDeadlines(referenceDate) {
        if (this.isRunning) {
            return { evaluatedPlans: 0, nudgesEmitted: 0, overdueEmitted: 0 };
        }
        this.isRunning = true;
        try {
            const now = referenceDate || new Date();
            const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const activePlans = await this.actionPlanRepo.findActivePlansWithDueMilestones(inThreeDays);
            let nudgesEmitted = 0;
            let overdueEmitted = 0;
            for (const plan of activePlans) {
                let planModified = false;
                for (const milestone of plan.milestones) {
                    // Completed milestones are skipped
                    if (milestone.status === 'COMPLETED' || milestone.completed === true) {
                        continue;
                    }
                    const dueDate = new Date(milestone.dueDate);
                    if (dueDate.getTime() < now.getTime()) {
                        // Overdue milestone
                        if (milestone.alertState !== 'OVERDUE_ESCALATED') {
                            const overdueEvent = new milestone_overdue_escalation_event_1.MilestoneOverdueEscalationEvent({
                                projectId: plan.projectId,
                                actionPlanId: plan.actionPlanId,
                                campaignId: plan.campaignId,
                                milestoneId: milestone.milestoneId,
                                milestoneTitle: milestone.title,
                                dueDate,
                                assigneeId: plan.assigneeId,
                                approverId: plan.approverId,
                            });
                            await this.eventBus.publish(overdueEvent);
                            milestone.alertState = 'OVERDUE_ESCALATED';
                            planModified = true;
                            overdueEmitted++;
                        }
                    }
                    else if (dueDate.getTime() <= inThreeDays.getTime()) {
                        // Approaching deadline within 3 days (nudge)
                        if (milestone.alertState !== 'NUDGE_SENT' && milestone.alertState !== 'OVERDUE_ESCALATED') {
                            const nudgeEvent = new milestone_nudge_event_1.MilestoneNudgeEvent({
                                projectId: plan.projectId,
                                actionPlanId: plan.actionPlanId,
                                campaignId: plan.campaignId,
                                milestoneId: milestone.milestoneId,
                                milestoneTitle: milestone.title,
                                dueDate,
                                assigneeId: plan.assigneeId,
                            });
                            await this.eventBus.publish(nudgeEvent);
                            milestone.alertState = 'NUDGE_SENT';
                            planModified = true;
                            nudgesEmitted++;
                        }
                    }
                }
                if (planModified) {
                    plan.updatedAt = new Date();
                    await this.actionPlanRepo.save(plan);
                }
            }
            return {
                evaluatedPlans: activePlans.length,
                nudgesEmitted,
                overdueEmitted,
            };
        }
        finally {
            this.isRunning = false;
        }
    }
}
exports.MilestoneEscalationWorker = MilestoneEscalationWorker;
//# sourceMappingURL=milestone-escalation-worker.js.map