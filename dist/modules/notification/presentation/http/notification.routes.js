"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationRouter = createNotificationRouter;
const express_1 = require("express");
const mongo_notification_repository_1 = require("../../infrastructure/persistence/mongoose/mongo-notification.repository");
const notification_service_1 = require("../../infrastructure/services/notification.service");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
function createNotificationRouter(repo = new mongo_notification_repository_1.MongoNotificationRepository(), service = notification_service_1.notificationService) {
    const router = (0, express_1.Router)();
    // 1. List Tenant Notifications
    router.get('/notifications', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            const user = req.user;
            const requestedProjectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            // Check project access if not SUPER_ADMIN
            const userProjects = user.authorizedProjectIds && user.authorizedProjectIds.length > 0
                ? user.authorizedProjectIds
                : user.projectId
                    ? [user.projectId]
                    : [];
            if (user.role !== auth_middleware_1.UserRole.SUPER_ADMIN &&
                userProjects.length > 0 &&
                !userProjects.includes(requestedProjectId)) {
                return res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/forbidden',
                    title: 'Forbidden',
                    status: 403,
                    detail: `User not authorized to access notifications for tenant '${requestedProjectId}'`,
                });
            }
            const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
            const category = req.query.category;
            const severity = req.query.severity;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const result = await repo.findTenantNotifications({
                projectId: requestedProjectId,
                recipientUserId: user.userId,
                recipientRole: user.role,
                isRead,
                category,
                severity,
                limit,
                offset,
            });
            res.status(200).json({
                projectId: requestedProjectId,
                notifications: result.notifications.map((n) => n.toJSON()),
                total: result.total,
            });
        }
        catch (err) {
            next(err);
        }
    });
    // 2. Unread Notification Count
    router.get('/notifications/unread-count', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            const user = req.user;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const unreadCount = await repo.countUnread(projectId, user.userId, user.role);
            res.status(200).json({
                projectId,
                unreadCount,
            });
        }
        catch (err) {
            next(err);
        }
    });
    // 3. Mark Single Notification as Read
    router.patch('/notifications/:notificationId/read', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            const user = req.user;
            const { notificationId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const success = await repo.markAsRead(notificationId, projectId);
            res.status(200).json({
                success,
                notificationId,
            });
        }
        catch (err) {
            next(err);
        }
    });
    // 4. Mark All Notifications as Read for Tenant
    router.post('/notifications/mark-all-read', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            const user = req.user;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const modifiedCount = await repo.markAllAsRead(projectId, user.userId, user.role);
            res.status(200).json({
                success: true,
                projectId,
                modifiedCount,
            });
        }
        catch (err) {
            next(err);
        }
    });
    // 5. Dismiss / Delete Notification
    router.delete('/notifications/:notificationId', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            const user = req.user;
            const { notificationId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const success = await repo.delete(notificationId, projectId);
            res.status(200).json({
                success,
                notificationId,
            });
        }
        catch (err) {
            next(err);
        }
    });
    // 6. Simulate Platform Event (Testing & Demo helper)
    router.post('/notifications/simulate', auth_middleware_1.authenticate, async (req, res, next) => {
        try {
            if (process.env.NODE_ENV === 'production') {
                return res.status(404).json({ error: 'Endpoint not found' });
            }
            const user = req.user;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const type = req.body?.type || 'AI_ANOMALY';
            let created;
            if (type === 'AI_ANOMALY') {
                created = await service.notifySentimentAnomaly(projectId, req.body?.nodeName || 'Technology & Innovation', req.body?.dropPercent || 14.2);
            }
            else if (type === 'CAMPAIGN') {
                created = await service.notifyCampaignMilestone(projectId, req.body?.campaignTitle || '2026 Annual Enterprise Engagement Pulse', req.body?.quorumPercent || 78);
            }
            else if (type === 'REPORT') {
                created = await service.notifyReportReady(projectId, user.userId, req.body?.reportTitle || 'Comprehensive Board Evaluation Report', '/reports');
            }
            else if (type === 'HRIS') {
                created = await service.notifyHrisSync(projectId, req.body?.recordsSynced || 450, req.body?.recordsUpdated || 12);
            }
            else {
                created = await service.notifyComplianceViolation(projectId, req.body?.details || 'Attempted aggregation query with sample size < 5 respondents');
            }
            res.status(201).json({
                success: true,
                notification: created.toJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=notification.routes.js.map