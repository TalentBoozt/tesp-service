export interface ExternalTaskSyncResult {
    system: 'JIRA' | 'MS_PLANNER';
    externalKey: string;
    syncedAt: Date;
}
export interface IExternalTaskAdapter {
    syncTask(projectId: string, actionPlanId: string, title: string, system: 'JIRA' | 'MS_PLANNER'): Promise<ExternalTaskSyncResult>;
}
