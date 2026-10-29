import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { ActionPlanEntity } from '../../domain/entities/action-plan.entity';
import { IExternalTaskAdapter } from '../adapters/external-task.adapter.interface';
export declare class SyncExternalTaskUseCase {
    private actionPlanRepo;
    private externalAdapter;
    private projectRepo?;
    constructor(actionPlanRepo: IActionPlanRepository, externalAdapter?: IExternalTaskAdapter, projectRepo?: any | undefined);
    execute(projectId: string, actionPlanId: string, system: 'JIRA' | 'MS_PLANNER', options?: any): Promise<ActionPlanEntity>;
}
