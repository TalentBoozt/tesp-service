import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
export declare class DeleteActionPlanUseCase {
    private actionPlanRepo;
    constructor(actionPlanRepo: IActionPlanRepository);
    execute(projectId: string, actionPlanId: string): Promise<void>;
}
