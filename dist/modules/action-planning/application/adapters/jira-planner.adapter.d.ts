import { IExternalTaskAdapter, ExternalTaskSyncResult, SyncTaskOptions } from './external-task.adapter.interface';
import { JiraIntegrationAdapter } from './jira.adapter';
import { PlannerIntegrationAdapter } from './planner.adapter';
export declare class JiraPlannerAdapter implements IExternalTaskAdapter {
    private jiraAdapter;
    private plannerAdapter;
    constructor(jiraAdapter?: JiraIntegrationAdapter, plannerAdapter?: PlannerIntegrationAdapter);
    syncTask(projectId: string, actionPlanId: string, title: string, system: 'JIRA' | 'MS_PLANNER', options?: SyncTaskOptions): Promise<ExternalTaskSyncResult>;
}
