import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
export declare class GetActionPlanUseCase {
    private actionPlanRepo;
    constructor(actionPlanRepo: IActionPlanRepository);
    execute(projectId: string, actionPlanId: string): Promise<ActionPlanEntity>;
}
