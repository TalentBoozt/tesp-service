"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRiskAlertsUseCase = void 0;
class GetRiskAlertsUseCase {
    aiInsightRepo;
    constructor(aiInsightRepo) {
        this.aiInsightRepo = aiInsightRepo;
    }
    async execute(projectId, campaignId) {
        return await this.aiInsightRepo.findRiskAlerts(projectId, campaignId);
    }
}
exports.GetRiskAlertsUseCase = GetRiskAlertsUseCase;
//# sourceMappingURL=get-risk-alerts.use-case.js.map