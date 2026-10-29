"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const project_config_routes_1 = require("./modules/project-config/presentation/http/project-config.routes");
const tenant_management_routes_1 = require("./modules/project-config/presentation/http/tenant-management.routes");
const tenant_user_management_routes_1 = require("./modules/project-config/presentation/http/tenant-user-management.routes");
const org_node_routes_1 = require("./modules/organization/presentation/http/org-node.routes");
const employee_routes_1 = require("./modules/employee/presentation/http/employee.routes");
const survey_routes_1 = require("./modules/survey/presentation/http/survey.routes");
const campaign_routes_1 = require("./modules/survey-distribution/presentation/http/campaign.routes");
const response_routes_1 = require("./modules/response-intake/presentation/http/response.routes");
const analytics_routes_1 = require("./modules/analytics-engine/presentation/http/analytics.routes");
const ai_analytics_routes_1 = require("./modules/ai-analytics/presentation/http/ai-analytics.routes");
const report_routes_1 = require("./modules/reporting-engine/presentation/http/report.routes");
const action_routes_1 = require("./modules/action-planning/presentation/http/action.routes");
const consultant_routes_1 = require("./modules/consultant/presentation/http/consultant.routes");
const consulting_firm_routes_1 = require("./modules/consultant/presentation/http/consulting-firm.routes");
const audit_log_routes_1 = require("./modules/audit-log/presentation/http/audit-log.routes");
const auth_routes_1 = require("./modules/auth/presentation/http/auth.routes");
const notification_routes_1 = require("./modules/notification/presentation/http/notification.routes");
const rate_limit_middleware_1 = require("./shared/presentation/middleware/rate-limit.middleware");
const error_middleware_1 = require("./shared/presentation/middleware/error.middleware");
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)());
    // Cross-Origin Resource Sharing (CORS) - Allow client app tesp.talnova.io
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : [
            'https://tesp.talnova.io',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
        ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                return callback(null, true);
            }
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                return callback(null, true);
            }
            // In production, reject untrusted origins
            return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Project-ID', 'Accept'],
    }));
    app.use(express_1.default.json({ limit: '20mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
    // Global Rate Limiter for all API routes
    app.use('/api/v1', rate_limit_middleware_1.globalRateLimiter);
    // Health check endpoint (bypasses rate limiting)
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
    });
    app.get('/api/v1/health', (req, res) => {
        res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
    });
    // Dedicated Enterprise Authentication Subsystem (PROMPT-24)
    app.use('/api/v1/auth', (0, auth_routes_1.createAuthRouter)());
    // Mount Domain Modules (DDD Modular Monolith Router)
    app.use('/api/v1', (0, project_config_routes_1.createProjectConfigRouter)());
    app.use('/api/v1', (0, org_node_routes_1.createOrgNodeRouter)());
    app.use('/api/v1', (0, employee_routes_1.createEmployeeRouter)());
    app.use('/api/v1', (0, survey_routes_1.createSurveyRouter)());
    app.use('/api/v1', (0, campaign_routes_1.createCampaignRouter)());
    app.use('/api/v1/responses', rate_limit_middleware_1.intakeRateLimiter);
    app.use('/api/v1', (0, response_routes_1.createResponseIntakeRouter)());
    app.use('/api/v1', (0, analytics_routes_1.createAnalyticsEngineRouter)());
    app.use('/api/v1', (0, ai_analytics_routes_1.createAiAnalyticsRouter)());
    app.use('/api/v1', (0, report_routes_1.createReportingEngineRouter)());
    app.use('/api/v1', (0, action_routes_1.createActionPlanningRouter)());
    app.use('/api/v1', (0, consultant_routes_1.createConsultantRouter)());
    app.use('/api/v1', (0, consulting_firm_routes_1.createConsultingFirmRouter)());
    app.use('/api/v1', (0, audit_log_routes_1.createAuditLogRouter)());
    app.use('/api/v1', (0, tenant_management_routes_1.createTenantManagementRouter)());
    app.use('/api/v1', (0, tenant_user_management_routes_1.createTenantUserManagementRouter)());
    app.use('/api/v1', (0, notification_routes_1.createNotificationRouter)());
    // Global RFC 7807 Error Handler
    app.use(error_middleware_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map