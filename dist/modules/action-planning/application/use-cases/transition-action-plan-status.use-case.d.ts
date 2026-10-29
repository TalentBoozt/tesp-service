import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity, ActionPlanStatus } from '../../domain/entities/action-plan.entity';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
export declare class TransitionActionPlanStatusUseCase {
    private actionPlanRepo;
    private eventBus;
    private stateMachine;
    private scoreEvaluator;
    constructor(actionPlanRepo: IActionPlanRepository, eventBus?: IEventBus);
    execute(projectId: string, actionPlanId: string, targetStatus: ActionPlanStatus, actorId: string, userRole?: UserRole, postActionScore?: number): Promise<ActionPlanEntity>;
}
