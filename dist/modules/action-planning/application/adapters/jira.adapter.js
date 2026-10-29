"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraIntegrationAdapter = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class JiraIntegrationAdapter {
    baseUrl;
    email;
    apiToken;
    projectKey;
    constructor(config) {
        this.baseUrl = config?.baseUrl || process.env.JIRA_BASE_URL || process.env.JIRA_HOST;
        this.email = config?.email || process.env.JIRA_EMAIL;
        this.apiToken = config?.apiToken || process.env.JIRA_API_TOKEN;
        this.projectKey = config?.projectKey || process.env.JIRA_PROJECT_KEY || 'SURV';
    }
    isConfigured() {
        return Boolean(this.baseUrl && this.email && this.apiToken);
    }
    async createIssue(projectId, actionPlanId, title, options) {
        const effectiveBaseUrl = options?.jiraConfig?.baseUrl || this.baseUrl;
        const effectiveEmail = options?.jiraConfig?.email || this.email;
        const effectiveApiToken = options?.jiraConfig?.apiToken || this.apiToken;
        const effectiveProjectKey = options?.jiraConfig?.projectKey || this.projectKey || 'SURV';
        if (!effectiveBaseUrl || !effectiveEmail || !effectiveApiToken) {
            return {
                system: 'JIRA',
                externalKey: 'PENDING_CONFIG',
                externalTaskId: 'PENDING_CONFIG',
                status: 'PENDING_CONFIG',
                syncedAt: new Date(),
                message: 'Jira integration credentials not configured (JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN)',
            };
        }
        const host = effectiveBaseUrl.replace(/\/$/, '');
        const url = `${host}/rest/api/3/issue`;
        const authHeader = 'Basic ' + Buffer.from(`${effectiveEmail}:${effectiveApiToken}`).toString('base64');
        // Atlassian Document Format (ADF) description
        const descriptionText = options?.description || `Action plan ${actionPlanId} synced from TalNova Enterprise Survey Platform.`;
        const payload = {
            fields: {
                project: {
                    key: effectiveProjectKey,
                },
                summary: title,
                description: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: descriptionText,
                                },
                            ],
                        },
                    ],
                },
                issuetype: {
                    name: 'Task',
                },
                ...(options?.targetCompletionDate
                    ? { duedate: options.targetCompletionDate.toISOString().split('T')[0] }
                    : {}),
            },
        };
        let res;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });
        }
        catch (err) {
            throw new error_middleware_1.AppError(502, `Failed to connect to Jira Cloud API: ${err.message}`);
        }
        if (!res.ok) {
            let errDetail = '';
            try {
                const errJson = await res.json();
                errDetail =
                    errJson.errorMessages?.join(', ') ||
                        (errJson.errors ? JSON.stringify(errJson.errors) : res.statusText);
            }
            catch {
                errDetail = await res.text().catch(() => res.statusText);
            }
            if (res.status === 401 || res.status === 403) {
                throw new error_middleware_1.AppError(401, `Jira authentication failed: ${errDetail}`);
            }
            if (res.status === 400) {
                throw new error_middleware_1.AppError(400, `Jira issue creation rejected: ${errDetail}`);
            }
            throw new error_middleware_1.AppError(res.status, `Jira API error (${res.status}): ${errDetail}`);
        }
        const data = await res.json();
        const externalKey = data.key;
        const externalTaskId = data.id || data.key;
        const externalUrl = `${host}/browse/${externalKey}`;
        return {
            system: 'JIRA',
            externalKey,
            externalTaskId,
            externalUrl,
            status: 'SYNCED',
            syncedAt: new Date(),
        };
    }
}
exports.JiraIntegrationAdapter = JiraIntegrationAdapter;
//# sourceMappingURL=jira.adapter.js.map