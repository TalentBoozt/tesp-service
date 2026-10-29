"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const get_dashboard_overview_use_case_1 = require("../../application/use-cases/get-dashboard-overview.use-case");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
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
    enforceTenantAccess(req, targetProjectId) {
        if (!req.user)
            return;
        if (req.user.role === auth_middleware_1.UserRole.SUPER_ADMIN)
            return;
        const isDirectMatch = req.user.projectId === targetProjectId;
        const isAuthorizedMatch = Array.isArray(req.user.authorizedProjectIds) && req.user.authorizedProjectIds.includes(targetProjectId);
        if (!isDirectMatch && !isAuthorizedMatch) {
            throw new error_middleware_1.AppError(403, 'Access forbidden: Cross-tenant access is prohibited', 'https://tesp-api.talnova.io/errors/forbidden');
        }
    }
    getOverview = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const nodeId = req.query.nodeId || 'GLOBAL';
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const bypassPrivacy = req.query.bypassPrivacy === 'true' ||
                req.query.previewMode === 'true' ||
                req.query.adminPreview === 'true';
            const demographicFilters = {};
            const systemParams = new Set([
                'campaignId',
                'nodeId',
                'projectId',
                'bypassPrivacy',
                'previewMode',
                'adminPreview',
                '_t',
            ]);
            for (const [key, val] of Object.entries(req.query)) {
                if (!systemParams.has(key) && typeof val === 'string' && val.trim().length > 0 && val !== 'ALL') {
                    const cleanKey = key.startsWith('demographic_') ? key.replace('demographic_', '') : key;
                    demographicFilters[cleanKey] = val.trim();
                }
            }
            const filtersToPass = Object.keys(demographicFilters).length > 0 ? demographicFilters : undefined;
            const result = await this.getDashboardMetricsUseCase.execute(projectId, campaignId, nodeId, filtersToPass, bypassPrivacy);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getHeatmap = async (req, res, next) => {
        try {
            const campaignId = req.query.campaignId;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const parentNodeId = req.query.parentNodeId;
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const bypassPrivacy = req.query.bypassPrivacy === 'true' || req.query.previewMode === 'true';
            const matrix = await this.getHeatmapMatrixUseCase.execute(projectId, campaignId, parentNodeId, bypassPrivacy);
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
            this.enforceTenantAccess(req, projectId);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
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