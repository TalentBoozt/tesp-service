"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLogRouter = createAuditLogRouter;
const express_1 = require("express");
const audit_log_service_1 = require("../../application/services/audit-log.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
function createAuditLogRouter(service) {
    const router = (0, express_1.Router)();
    const auditLogService = service || audit_log_service_1.AuditLogService.getInstance();
    /**
     * GET /api/v1/audit-logs
     * List audit logs with pagination and filters
     * Accessible by SUPER_ADMIN, PROJECT_ADMIN, and CONSULTANT_DAASH
     */
    router.get('/audit-logs', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const user = req.user;
            const requestedProjectId = req.query.projectId || undefined;
            // If not SUPER_ADMIN, scope to user's assigned project
            let projectId = user.projectId;
            if (user.role === auth_middleware_1.UserRole.SUPER_ADMIN) {
                projectId = requestedProjectId || user.projectId || (req.query.allProjects === 'true' ? 'ALL' : (0, tenant_context_1.resolveTenantProjectId)(req));
            }
            else if (requestedProjectId && requestedProjectId !== user.projectId) {
                projectId = user.projectId; // Tenant isolation enforcement
            }
            const result = await auditLogService.queryLogs({
                projectId: req.query.allProjects === 'true' && user.role === auth_middleware_1.UserRole.SUPER_ADMIN ? 'ALL' : projectId,
                action: req.query.action,
                resourceType: req.query.resourceType,
                actorId: req.query.actorId,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                page: req.query.page ? parseInt(req.query.page, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
            });
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * POST /api/v1/audit-logs
     * Manually record an explicit audit event (e.g. client report export or compliance action)
     */
    router.post('/audit-logs', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), async (req, res, next) => {
        try {
            const user = req.user;
            const { action, resourceType, resourceId, metadata } = req.body;
            if (!action || !resourceType || !resourceId) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'action, resourceType, and resourceId are required',
                });
            }
            const doc = await auditLogService.recordAuditLog({
                projectId: (0, tenant_context_1.resolveTenantProjectId)(req),
                actorId: user.userId,
                actorRole: user.role,
                action,
                resourceType,
                resourceId,
                metadata: metadata || {},
                ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            });
            res.status(201).json({
                status: 'SUCCESS',
                record: doc,
            });
        }
        catch (err) {
            next(err);
        }
    });
    /**
     * GET /api/v1/audit-logs/metadata/filters
     * Returns available filter values (actions, resourceTypes)
     */
    router.get('/audit-logs/metadata/filters', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH]), (_req, res) => {
        res.status(200).json({
            actions: [
                'SURVEY_PUBLISHED',
                'SURVEY_DRAFT_CREATED',
                'SURVEY_MODIFIED',
                'SURVEY_VERSION_CLONED',
                'FEATURE_FLAG_TOGGLED',
                'PROJECT_SETTINGS_UPDATED',
                'KIOSK_PINS_GENERATED',
                'HRIS_SYNC_COMPLETED',
                'REPORT_DOWNLOADED',
                'SECURITY_POLICY_UPDATED',
                'EMPLOYEE_CREATED',
                'EMPLOYEE_UPDATED',
                'EMPLOYEE_TERMINATED',
                'ORG_NODE_CREATED',
            ],
            resourceTypes: ['SURVEY', 'PROJECT', 'CAMPAIGN', 'EMPLOYEE', 'REPORT', 'ORGANIZATION', 'SYSTEM'],
        });
    });
    return router;
}
//# sourceMappingURL=audit-log.routes.js.map