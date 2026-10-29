"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraPlannerAdapter = void 0;
const jira_adapter_1 = require("./jira.adapter");
const planner_adapter_1 = require("./planner.adapter");
class JiraPlannerAdapter {
    jiraAdapter;
    plannerAdapter;
    constructor(jiraAdapter, plannerAdapter) {
        this.jiraAdapter = jiraAdapter || new jira_adapter_1.JiraIntegrationAdapter();
        this.plannerAdapter = plannerAdapter || new planner_adapter_1.PlannerIntegrationAdapter();
    }
    async syncTask(projectId, actionPlanId, title, system, options) {
        if (system === 'JIRA') {
            return await this.jiraAdapter.createIssue(projectId, actionPlanId, title, options);
        }
        if (system === 'MS_PLANNER') {
            return await this.plannerAdapter.createTask(projectId, actionPlanId, title, options);
        }
        throw new Error(`Unsupported external sync system: ${system}`);
    }
}
exports.JiraPlannerAdapter = JiraPlannerAdapter;
//# sourceMappingURL=jira-planner.adapter.js.map