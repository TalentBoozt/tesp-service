"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraPlannerAdapter = void 0;
class JiraPlannerAdapter {
    async syncTask(projectId, actionPlanId, title, system) {
        const keyPrefix = system === 'JIRA' ? 'ENG' : 'PLN';
        const externalKey = `${keyPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
            system,
            externalKey,
            syncedAt: new Date(),
        };
    }
}
exports.JiraPlannerAdapter = JiraPlannerAdapter;
//# sourceMappingURL=jira-planner.adapter.js.map