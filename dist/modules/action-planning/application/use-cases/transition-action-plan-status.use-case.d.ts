import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity, ActionPlanStatus } from '../../domain/entities/action-plan.entity';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export declare class TransitionActionPlanStatusUseCase {
    private actionPlanRepo;
    private stateMachine;
    private scoreEvaluator;
    constructor(actionPlanRepo: IActionPlanRepository);
    execute(projectId: string, actionPlanId: string, targetStatus: ActionPlanStatus, actorId: string, userRole?: UserRole, postActionScore?: number): Promise<ActionPlanEntity>;
}
