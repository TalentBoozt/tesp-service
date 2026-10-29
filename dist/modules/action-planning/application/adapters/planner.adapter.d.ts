import { ExternalTaskSyncResult, SyncTaskOptions } from './external-task.adapter.interface';
export interface PlannerConfig {
    token?: string;
    planId?: string;
}
export declare class PlannerIntegrationAdapter {
    private token?;
    private planId?;
    constructor(config?: PlannerConfig);
    isConfigured(): boolean;
    createTask(projectId: string, actionPlanId: string, title: string, options?: SyncTaskOptions): Promise<ExternalTaskSyncResult>;
}
