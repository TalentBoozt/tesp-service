export interface ExternalTaskSyncResult {
    system: 'JIRA' | 'MS_PLANNER';
    externalKey: string;
    externalTaskId?: string;
    externalUrl?: string;
    status: 'SYNCED' | 'PENDING_CONFIG';
    syncedAt: Date;
    message?: string;
}
export interface SyncTaskOptions {
    description?: string;
    targetCompletionDate?: Date;
    priority?: string;
    assigneeEmail?: string;
    jiraConfig?: {
        baseUrl?: string;
        email?: string;
        apiToken?: string;
        projectKey?: string;
    };
    plannerConfig?: {
        token?: string;
        planId?: string;
    };
}
export interface IExternalTaskAdapter {
    syncTask(projectId: string, actionPlanId: string, title: string, system: 'JIRA' | 'MS_PLANNER', options?: SyncTaskOptions): Promise<ExternalTaskSyncResult>;
}
