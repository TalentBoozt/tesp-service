import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
import { CreateActionPlanDto } from '../dto/action-plan.dto';
export declare class CreateActionPlanUseCase {
    private actionPlanRepo;
    constructor(actionPlanRepo: IActionPlanRepository);
    execute(dto: CreateActionPlanDto): Promise<ActionPlanEntity>;
}
