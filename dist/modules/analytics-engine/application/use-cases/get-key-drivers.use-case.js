"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKeyDriversUseCase = void 0;
const ai_key_driver_service_1 = require("../../domain/services/ai-key-driver.service");
class GetKeyDriversUseCase {
    getDashboardMetricsUseCase;
    snapshotRepo;
    responseRepo;
    aiKeyDriverService;
    constructor(getDashboardMetricsUseCase, snapshotRepo, responseRepo) {
        this.getDashboardMetricsUseCase = getDashboardMetricsUseCase;
        this.snapshotRepo = snapshotRepo;
        this.responseRepo = responseRepo;
        this.aiKeyDriverService = new ai_key_driver_service_1.AiKeyDriverService();
    }
    async execute(projectId, campaignId) {
        const dashboardMetrics = await this.getDashboardMetricsUseCase.execute(projectId, campaignId);
        let keyDrivers = [];
        // Prioritize respondent-level bivariate Pearson correlation analysis
        if (this.responseRepo) {
            try {
                const { responses } = await this.responseRepo.findAllByCampaign(projectId, campaignId, { limit: 10000 });
                if (responses && responses.length >= 2) {
                    keyDrivers = this.aiKeyDriverService.analyzeKeyDrivers(responses);
                }
            }
            catch {
                // Fallback to groupScores if raw responses query fails
            }
        }
        if (keyDrivers.length === 0) {
            keyDrivers = this.aiKeyDriverService.analyzeKeyDrivers(dashboardMetrics.groupScores);
        }
        const anomalyAlerts = [];
        if (this.snapshotRepo) {
            const baseline = await this.snapshotRepo.findLatestBaseline(projectId, campaignId);
            if (baseline) {
                const baselineMap = new Map();
                for (const node of baseline.nodeAggregates) {
                    if (node.engagementIndex !== null) {
                        baselineMap.set(node.nodeId, node.engagementIndex);
                    }
                }
                const currentNodes = dashboardMetrics.groupScores.map((g) => ({
                    nodeId: g.groupId,
                    score: g.score,
                }));
                anomalyAlerts.push(...this.aiKeyDriverService.detectAnomalies(currentNodes, baselineMap));
            }
        }
        return {
            campaignId,
            keyDrivers,
            anomalyAlerts,
        };
    }
}
exports.GetKeyDriversUseCase = GetKeyDriversUseCase;
//# sourceMappingURL=get-key-drivers.use-case.js.map