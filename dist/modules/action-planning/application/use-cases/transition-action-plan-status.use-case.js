"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionActionPlanStatusUseCase = void 0;
const action_state_machine_service_1 = require("../../domain/services/action-state-machine.service");
const score_delta_evaluator_service_1 = require("../../domain/services/score-delta-evaluator.service");
const action_plan_status_changed_event_1 = require("../../domain/events/action-plan-status-changed.event");
class TransitionActionPlanStatusUseCase {
    actionPlanRepo;
    stateMachine;
    scoreEvaluator;
    constructor(actionPlanRepo) {
        this.actionPlanRepo = actionPlanRepo;
        this.stateMachine = new action_state_machine_service_1.ActionStateMachineService();
        this.scoreEvaluator = new score_delta_evaluator_service_1.ScoreDeltaEvaluatorService();
    }
    async execute(projectId, actionPlanId, targetStatus, actorId, userRole, postActionScore) {
        const actionPlan = await this.actionPlanRepo.findByActionPlanId(projectId, actionPlanId);
        if (!actionPlan) {
            throw new Error(`Action Plan '${actionPlanId}' not found`);
        }
        const oldStatus = actionPlan.status;
        // 1. Validate State Machine & Role Guard (BR-ACT-001)
        this.stateMachine.validateTransition(oldStatus, targetStatus, userRole);
        // 2. Additional verification check for VERIFIED state (FR-ACT-006, TC-ACT-002)
        if (targetStatus === 'VERIFIED') {
            if (postActionScore === undefined) {
                throw new Error('postActionScore is required for VERIFIED state transition');
            }
            const evalResult = this.scoreEvaluator.evaluateDelta(actionPlan.baselineScore, postActionScore);
            if (!evalResult.isVerified) {
                throw new Error(`Cannot verify action plan: post-action score delta (${evalResult.delta}) is not positive`);
            }
            actionPlan.postActionScore = postActionScore;
        }
        if (targetStatus === 'APPROVED') {
            actionPlan.approverId = actorId;
        }
        actionPlan.status = targetStatus;
        actionPlan.updatedAt = new Date();
        const saved = await this.actionPlanRepo.save(actionPlan);
        // 3. Emit Domain Event (FR-ACT-008)
        new action_plan_status_changed_event_1.ActionPlanStatusChangedEvent({
            projectId,
            campaignId: actionPlan.campaignId,
            actionPlanId,
            nodeId: actionPlan.nodeId,
            oldStatus,
            newStatus: targetStatus,
            actorId,
        });
        return saved;
    }
}
exports.TransitionActionPlanStatusUseCase = TransitionActionPlanStatusUseCase;
//# sourceMappingURL=transition-action-plan-status.use-case.js.map