import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
import { IExternalTaskAdapter } from '../adapters/external-task.adapter.interface';
export declare class SyncExternalTaskUseCase {
    private actionPlanRepo;
    private externalAdapter;
    constructor(actionPlanRepo: IActionPlanRepository, externalAdapter?: IExternalTaskAdapter);
    execute(projectId: string, actionPlanId: string, system: 'JIRA' | 'MS_PLANNER'): Promise<ActionPlanEntity>;
}
