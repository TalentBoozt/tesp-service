import { ActionPlanStatus } from '../entities/action-plan.entity';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export declare class ActionStateMachineService {
    private allowedTransitions;
    canTransition(current: ActionPlanStatus, target: ActionPlanStatus, userRole?: UserRole): boolean;
    validateTransition(current: ActionPlanStatus, target: ActionPlanStatus, userRole?: UserRole): void;
}
