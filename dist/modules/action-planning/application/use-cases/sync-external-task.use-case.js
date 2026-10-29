"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncExternalTaskUseCase = void 0;
const jira_planner_adapter_1 = require("../adapters/jira-planner.adapter");
class SyncExternalTaskUseCase {
    actionPlanRepo;
    externalAdapter;
    projectRepo;
    constructor(actionPlanRepo, externalAdapter = new jira_planner_adapter_1.JiraPlannerAdapter(), projectRepo) {
        this.actionPlanRepo = actionPlanRepo;
        this.externalAdapter = externalAdapter;
        this.projectRepo = projectRepo;
    }
    async execute(projectId, actionPlanId, system, options) {
        const actionPlan = await this.actionPlanRepo.findByActionPlanId(projectId, actionPlanId);
        if (!actionPlan) {
            throw new Error(`Action Plan '${actionPlanId}' not found`);
        }
        let projectIntegrations;
        if (this.projectRepo && typeof this.projectRepo.findByProjectId === 'function') {
            try {
                const p = await this.projectRepo.findByProjectId(projectId);
                projectIntegrations = p?.integrations;
            }
            catch { }
        }
        const syncResult = await this.externalAdapter.syncTask(projectId, actionPlanId, actionPlan.title, system, {
            description: actionPlan.description,
            targetCompletionDate: actionPlan.targetCompletionDate,
            jiraConfig: options?.jiraConfig || projectIntegrations?.jira,
            plannerConfig: options?.plannerConfig || projectIntegrations?.planner,
            ...options,
        });
        // Outbound Webhook Dispatch (PROMPT-05, Step 3)
        const webhookUrl = system === 'JIRA'
            ? process.env.WEBHOOK_JIRA_URL
            : process.env.WEBHOOK_TEAMS_URL || process.env.WEBHOOK_SLACK_URL;
        if (webhookUrl && syncResult.status === 'SYNCED') {
            try {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'ACTION_PLAN_SYNCED',
                        actionPlanId,
                        projectId,
                        system,
                        externalTaskId: syncResult.externalTaskId || syncResult.externalKey,
                        externalKey: syncResult.externalKey,
                        externalUrl: syncResult.externalUrl,
                        title: actionPlan.title,
                        targetScore: actionPlan.targetScore,
                        targetCompletionDate: actionPlan.targetCompletionDate,
                        timestamp: new Date().toISOString(),
                    }),
                }).catch(() => { });
            }
            catch {
                // Non-blocking webhook dispatch
            }
        }
        actionPlan.externalSync = {
            system: syncResult.system,
            externalKey: syncResult.externalKey,
            externalTaskId: syncResult.externalTaskId || syncResult.externalKey,
            externalUrl: syncResult.externalUrl,
            status: syncResult.status,
            lastSyncedAt: syncResult.syncedAt,
        };
        actionPlan.updatedAt = new Date();
        return await this.actionPlanRepo.save(actionPlan);
    }
}
exports.SyncExternalTaskUseCase = SyncExternalTaskUseCase;
//# sourceMappingURL=sync-external-task.use-case.js.map