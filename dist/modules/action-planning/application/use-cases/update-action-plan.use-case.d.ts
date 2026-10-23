import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
import { UpdateActionPlanDto } from '../dto/action-plan.dto';
export declare class UpdateActionPlanUseCase {
    private actionPlanRepo;
    constructor(actionPlanRepo: IActionPlanRepository);
    execute(projectId: string, actionPlanId: string, dto: UpdateActionPlanDto): Promise<ActionPlanEntity>;
    toggleMilestone(projectId: string, actionPlanId: string, milestoneId: string, completed: boolean): Promise<ActionPlanEntity>;
}
