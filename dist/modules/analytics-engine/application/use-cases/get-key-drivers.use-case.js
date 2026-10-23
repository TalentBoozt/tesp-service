"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKeyDriversUseCase = void 0;
const ai_key_driver_service_1 = require("../../domain/services/ai-key-driver.service");
class GetKeyDriversUseCase {
    getDashboardMetricsUseCase;
    snapshotRepo;
    aiKeyDriverService;
    constructor(getDashboardMetricsUseCase, snapshotRepo) {
        this.getDashboardMetricsUseCase = getDashboardMetricsUseCase;
        this.snapshotRepo = snapshotRepo;
        this.aiKeyDriverService = new ai_key_driver_service_1.AiKeyDriverService();
    }
    async execute(projectId, campaignId) {
        const dashboardMetrics = await this.getDashboardMetricsUseCase.execute(projectId, campaignId);
        const keyDrivers = this.aiKeyDriverService.analyzeKeyDrivers(dashboardMetrics.groupScores);
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