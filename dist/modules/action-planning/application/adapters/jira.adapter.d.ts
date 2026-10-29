import { ExternalTaskSyncResult, SyncTaskOptions } from './external-task.adapter.interface';
export interface JiraConfig {
    baseUrl?: string;
    email?: string;
    apiToken?: string;
    projectKey?: string;
}
export declare class JiraIntegrationAdapter {
    private baseUrl?;
    private email?;
    private apiToken?;
    private projectKey?;
    constructor(config?: JiraConfig);
    isConfigured(): boolean;
    createIssue(projectId: string, actionPlanId: string, title: string, options?: SyncTaskOptions): Promise<ExternalTaskSyncResult>;
}
