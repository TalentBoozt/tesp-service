import { ActionPlanEntity, ActionPlanStatus } from '../entities/action-plan.entity';
export interface IActionPlanRepository {
    save(actionPlan: ActionPlanEntity): Promise<ActionPlanEntity>;
    findByActionPlanId(projectId: string, actionPlanId: string): Promise<ActionPlanEntity | null>;
    findByExternalTaskId?(projectId: string, externalTaskId: string): Promise<ActionPlanEntity | null>;
    findAllByNode(projectId: string, nodeId?: string, status?: ActionPlanStatus): Promise<ActionPlanEntity[]>;
    delete(projectId: string, actionPlanId: string): Promise<boolean>;
    updateMilestone?(projectId: string, actionPlanId: string, milestoneId: string, completed: boolean): Promise<ActionPlanEntity | null>;
    findActivePlansWithDueMilestones(cutoffDate: Date): Promise<ActionPlanEntity[]>;
}
