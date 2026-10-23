import { IExternalTaskAdapter, ExternalTaskSyncResult } from './external-task.adapter.interface';
export declare class JiraPlannerAdapter implements IExternalTaskAdapter {
    syncTask(projectId: string, actionPlanId: string, title: string, system: 'JIRA' | 'MS_PLANNER'): Promise<ExternalTaskSyncResult>;
}
