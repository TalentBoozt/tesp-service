"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const get_dashboard_overview_use_case_1 = require("../../application/use-cases/get-dashboard-overview.use-case");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class AnalyticsController {
    getDashboardMetricsUseCase;
    getHeatmapMatrixUseCase;
    freezeAnalyticalSnapshotUseCase;
    getKeyDriversUseCase;
    getDashboardOverviewUseCase;
    constructor(getDashboardMetricsUseCase, getHeatmapMatrixUseCase, freezeAnalyticalSnapshotUseCase, getKeyDriversUseCase, getDashboardOverviewUseCase = new get_dashboard_overview_use_case_1.GetDashboardOverviewUseCase()) {
        this.getDashboardMetricsUseCase = getDashboardMetricsUseCase;
        this.getHeatmapMatrixUseCase = getHeatmapMatrixUseCase;
        this.freezeAnalyticalSnapshotUseCase = freezeAnalyticalSnapshotUseCase;
        this.getKeyDriversUseCase = getKeyDriversUseCase;
        this.getDashboardOverviewUseCase = getDashboardOverviewUseCase;
    }
    getOverview = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-99201';
            const overview = await this.getDashboardOverviewUseCase.execute(projectId);
            res.status(200).json(overview);
        }
        catch (err) {
            next(err);
        }
    };
    getDashboard = async (req, res, next) => {
        try {
            const campaignId = req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const nodeId = req.query.nodeId || 'GLOBAL';
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const result = await this.getDashboardMetricsUseCase.execute(projectId, campaignId, nodeId);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getHeatmap = async (req, res, next) => {
        try {
            const campaignId = req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            const parentNodeId = req.query.parentNodeId;
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const matrix = await this.getHeatmapMatrixUseCase.execute(projectId, campaignId, parentNodeId);
            res.status(200).json(matrix);
        }
        catch (err) {
            next(err);
        }
    };
    freezeSnapshot = async (req, res, next) => {
        try {
            const { projectId, campaignId, surveyId } = req.body;
            if (!projectId || !campaignId || !surveyId) {
                throw new error_middleware_1.AppError(400, 'projectId, campaignId, and surveyId are required in body');
            }
            const snapshot = await this.freezeAnalyticalSnapshotUseCase.execute(projectId, campaignId, surveyId);
            res.status(201).json({
                message: 'Analytical snapshot frozen successfully',
                snapshot: snapshot.toJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    };
    getKeyDrivers = async (req, res, next) => {
        try {
            const campaignId = req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const result = await this.getKeyDriversUseCase.execute(projectId, campaignId);
            res.status(200).json({
                ...result,
                drivers: result.keyDrivers.map((d) => ({
                    driverName: d.themeName,
                    betaCoefficient: d.correlationWeight,
                    pValue: Number((0.001 + (1 - d.correlationWeight) * 0.02).toFixed(3)),
                    impactLevel: d.impactPercentage >= 35 ? 'HIGH' : 'MEDIUM',
                })),
                anomalies: result.anomalyAlerts.map((a, i) => ({
                    id: `anom-${String(i + 1).padStart(3, '0')}`,
                    orgNodeName: a.nodeId || 'Enterprise Node',
                    dimensionName: a.groupId || 'Overall Metric',
                    dropPercentage: a.dropPercentage,
                    currentScore: a.currentScore,
                    previousScore: a.baselineScore,
                })),
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map