"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerIntegrationAdapter = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class PlannerIntegrationAdapter {
    token;
    planId;
    constructor(config) {
        this.token = config?.token || process.env.MS_PLANNER_TOKEN || process.env.GRAPH_API_TOKEN;
        this.planId = config?.planId || process.env.MS_PLANNER_PLAN_ID;
    }
    isConfigured() {
        return Boolean(this.token && this.planId);
    }
    async createTask(projectId, actionPlanId, title, options) {
        const effectiveToken = options?.plannerConfig?.token || this.token;
        const effectivePlanId = options?.plannerConfig?.planId || this.planId;
        if (!effectiveToken || !effectivePlanId) {
            return {
                system: 'MS_PLANNER',
                externalKey: 'PENDING_CONFIG',
                externalTaskId: 'PENDING_CONFIG',
                status: 'PENDING_CONFIG',
                syncedAt: new Date(),
                message: 'Microsoft Planner credentials not configured (MS_PLANNER_TOKEN, MS_PLANNER_PLAN_ID)',
            };
        }
        const url = 'https://graph.microsoft.com/v1.0/planner/tasks';
        const payload = {
            planId: effectivePlanId,
            title,
            ...(options?.targetCompletionDate
                ? { dueDateTime: options.targetCompletionDate.toISOString() }
                : {}),
        };
        let res;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${effectiveToken}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });
        }
        catch (err) {
            throw new error_middleware_1.AppError(502, `Failed to connect to Microsoft Graph API: ${err.message}`);
        }
        if (!res.ok) {
            let errDetail = '';
            try {
                const errJson = await res.json();
                errDetail = errJson.error?.message || res.statusText;
            }
            catch {
                errDetail = await res.text().catch(() => res.statusText);
            }
            if (res.status === 401 || res.status === 403) {
                throw new error_middleware_1.AppError(401, `Microsoft Graph authentication failed: ${errDetail}`);
            }
            throw new error_middleware_1.AppError(res.status, `Microsoft Planner API error (${res.status}): ${errDetail}`);
        }
        const data = await res.json();
        const taskId = data.id;
        const planId = data.planId || this.planId;
        const externalUrl = `https://tasks.office.com/plan/${planId}/task/${taskId}`;
        return {
            system: 'MS_PLANNER',
            externalKey: taskId,
            externalTaskId: taskId,
            externalUrl,
            status: 'SYNCED',
            syncedAt: new Date(),
        };
    }
}
exports.PlannerIntegrationAdapter = PlannerIntegrationAdapter;
//# sourceMappingURL=planner.adapter.js.map