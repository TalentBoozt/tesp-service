import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity, ActionPlanStatus } from '../../domain/entities/action-plan.entity';
export interface KanbanBoardResult {
    DRAFT: ActionPlanEntity[];
    PROPOSED: ActionPlanEntity[];
    APPROVED: ActionPlanEntity[];
    REJECTED: ActionPlanEntity[];
    IN_PROGRESS: ActionPlanEntity[];
    COMPLETED: ActionPlanEntity[];
    VERIFIED: ActionPlanEntity[];
    CANCELLED: ActionPlanEntity[];
}
export declare class ListActionPlansUseCase {
    private actionPlanRepo;
    constructor(actionPlanRepo: IActionPlanRepository);
    execute(projectId: string, nodeId?: string, status?: ActionPlanStatus): Promise<ActionPlanEntity[]>;
    getKanbanBoard(projectId: string, nodeId?: string): Promise<KanbanBoardResult>;
}
