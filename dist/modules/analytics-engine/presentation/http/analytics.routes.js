"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnalyticsEngineRouter = createAnalyticsEngineRouter;
const express_1 = require("express");
const analytical_snapshot_repository_1 = require("../../infrastructure/persistence/mongoose/analytical-snapshot.repository");
const survey_response_repository_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.repository");
const redis_analytics_repository_1 = require("../../infrastructure/cache/redis-analytics.repository");
const get_dashboard_metrics_use_case_1 = require("../../application/use-cases/get-dashboard-metrics.use-case");
const get_heatmap_matrix_use_case_1 = require("../../application/use-cases/get-heatmap-matrix.use-case");
const freeze_analytical_snapshot_use_case_1 = require("../../application/use-cases/freeze-analytical-snapshot.use-case");
const get_key_drivers_use_case_1 = require("../../application/use-cases/get-key-drivers.use-case");
const analytics_controller_1 = require("./analytics.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createAnalyticsEngineRouter(snapshotRepo, responseRepo, redisAnalyticsRepo) {
    const router = (0, express_1.Router)();
    const snRepo = snapshotRepo || new analytical_snapshot_repository_1.AnalyticalSnapshotMongoRepository();
    const resRepo = responseRepo || new survey_response_repository_1.SurveyResponseMongoRepository();
    const rAnalyticsRepo = redisAnalyticsRepo || new redis_analytics_repository_1.RedisAnalyticsRepository();
    const getDashboardMetricsUseCase = new get_dashboard_metrics_use_case_1.GetDashboardMetricsUseCase(resRepo, rAnalyticsRepo);
    const getHeatmapMatrixUseCase = new get_heatmap_matrix_use_case_1.GetHeatmapMatrixUseCase(resRepo);
    const freezeAnalyticalSnapshotUseCase = new freeze_analytical_snapshot_use_case_1.FreezeAnalyticalSnapshotUseCase(snRepo, resRepo);
    const getKeyDriversUseCase = new get_key_drivers_use_case_1.GetKeyDriversUseCase(getDashboardMetricsUseCase, snRepo);
    const controller = new analytics_controller_1.AnalyticsController(getDashboardMetricsUseCase, getHeatmapMatrixUseCase, freezeAnalyticalSnapshotUseCase, getKeyDriversUseCase);
    router.use('/analytics', auth_middleware_1.authenticate);
    router.get('/analytics/overview', controller.getOverview);
    router.get('/analytics/summary', controller.getOverview);
    router.get('/analytics/dashboard', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getDashboard);
    router.get('/analytics/heatmap', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.DEPARTMENT_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getHeatmap);
    router.get('/analytics/key-drivers', (0, auth_middleware_1.authorize)([
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.PROJECT_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
        auth_middleware_1.UserRole.ORG_ADMIN,
        auth_middleware_1.UserRole.HR_MANAGER,
        auth_middleware_1.UserRole.REPORT_VIEWER,
    ]), controller.getKeyDrivers);
    router.post('/analytics/snapshots', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN]), controller.freezeSnapshot);
    return router;
}
//# sourceMappingURL=analytics.routes.js.map