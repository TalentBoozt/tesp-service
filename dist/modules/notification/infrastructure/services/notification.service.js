"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const mongo_notification_repository_1 = require("../persistence/mongoose/mongo-notification.repository");
const notification_entity_1 = require("../../domain/entities/notification.entity");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const email_gateway_service_1 = require("../../../../shared/infrastructure/email/email-gateway.service");
const user_schema_1 = require("../../../auth/infrastructure/persistence/user.schema");
const mongoose_1 = __importDefault(require("mongoose"));
class NotificationService {
    repo;
    constructor(repo = new mongo_notification_repository_1.MongoNotificationRepository()) {
        this.repo = repo;
    }
    generateId(projectId) {
        const cleanProject = projectId.replace(/^PRJ-?/i, '').replace(/[^A-Za-z0-9_]/g, '').substring(0, 14).toUpperCase() || 'SYS';
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `NTF-${cleanProject}-${randomHex}`;
    }
    async resolveAlertRecipients(projectId) {
        const recipients = [];
        if (mongoose_1.default.connection?.readyState === 1) {
            try {
                const users = await user_schema_1.UserModel.find({
                    $or: [
                        { primaryProjectId: projectId },
                        { authorizedProjectIds: projectId },
                    ],
                    role: {
                        $in: [
                            auth_middleware_1.UserRole.PROJECT_ADMIN,
                            auth_middleware_1.UserRole.SUPER_ADMIN,
                            auth_middleware_1.UserRole.ORG_ADMIN,
                            auth_middleware_1.UserRole.CONSULTANT,
                            auth_middleware_1.UserRole.CONSULTANT_DAASH,
                        ],
                    },
                    isActive: true,
                })
                    .select('email firstName lastName')
                    .lean();
                for (const u of users) {
                    if (u.email && u.email.trim().length > 0) {
                        recipients.push({
                            email: u.email.trim(),
                            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Tenant Administrator',
                        });
                    }
                }
            }
            catch (err) {
                console.warn(`[NotificationService] Failed to query admin recipients for ${projectId}:`, err);
            }
        }
        if (recipients.length === 0) {
            const fallbackEmail = process.env.TENANT_ALERT_EMAIL || process.env.ADMIN_ALERT_EMAIL;
            if (fallbackEmail) {
                recipients.push({
                    email: fallbackEmail.trim(),
                    name: 'Designated Administrator',
                });
            }
        }
        return recipients;
    }
    async createNotification(props, options) {
        const notificationId = this.generateId(props.projectId);
        const notification = new notification_entity_1.NotificationEntity({
            ...props,
            notificationId,
        });
        const saved = await this.repo.save(notification);
        // If severity is CRITICAL or explicit dispatchEmail is requested, forward outbound alert
        if (saved.severity === 'CRITICAL' || options?.dispatchEmail) {
            try {
                const recipients = await this.resolveAlertRecipients(saved.projectId);
                if (recipients.length > 0) {
                    const frontendBaseUrl = (process.env.APP_FRONTEND_URL || 'https://app.talnova.com').replace(/\/$/, '');
                    const actionFullUrl = `${frontendBaseUrl}${saved.actionUrl || '/dashboard'}`;
                    const isCritical = saved.severity === 'CRITICAL';
                    const headerColor = isCritical ? '#dc2626' : '#2563eb';
                    const bgHeader = isCritical ? '#fff5f5' : '#f8fafc';
                    const borderHeader = isCritical ? '#fee2e2' : '#e2e8f0';
                    await email_gateway_service_1.emailGatewayService.dispatch({
                        projectId: saved.projectId,
                        to: recipients,
                        subject: options?.emailSubject || `${isCritical ? '[CRITICAL ALERT] ' : '[NOTIFICATION] '}${saved.title}`,
                        htmlBody: `
              <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid ${borderHeader}; border-radius: 12px; background: ${bgHeader};">
                <h3 style="color: ${headerColor}; margin-top: 0;">${saved.title}</h3>
                <p style="font-size: 14px; line-height: 1.5;">${saved.message}</p>
                <div style="margin: 20px 0;">
                  <a href="${actionFullUrl}" style="background-color: ${headerColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">
                    View in Talnova Platform
                  </a>
                </div>
                <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
                  Tenant: ${saved.projectId} &bull; Category: ${saved.category} &bull; Severity: ${saved.severity}
                </p>
              </div>
            `,
                    });
                    saved.setEmailDispatched();
                    await this.repo.save(saved);
                }
            }
            catch (err) {
                // Non-blocking outbound notification failure
            }
        }
        return saved;
    }
    async notifyTenantProvisioned(projectId, tenantName, clientName, tier) {
        return this.createNotification({
            projectId,
            category: 'ORGANIZATION',
            severity: 'SUCCESS',
            title: `New Organization Provisioned: ${tenantName}`,
            message: `Tenant "${tenantName}" (${projectId}) has been successfully provisioned on tier ${tier || 'ENTERPRISE'}. Ready for hierarchy configuration and campaign deployment.`,
            actionUrl: `/admin/tenants`,
            metadata: { projectId, tenantName, clientName, tier },
        }, { dispatchEmail: false });
    }
    async notifyOrgNodeCreated(projectId, nodeName, nodeType, parentNodeId) {
        return this.createNotification({
            projectId,
            category: 'ORGANIZATION',
            severity: 'INFO',
            title: `Organization Unit Added: ${nodeName}`,
            message: `Unit "${nodeName}" (${nodeType}) was added to organizational structure.`,
            actionUrl: '/organization',
            metadata: { nodeName, nodeType, parentNodeId },
        });
    }
    async notifySurveyResponseSubmitted(projectId, surveyId, campaignId, respondentCount) {
        const countText = respondentCount !== undefined ? ` (Total responses: ${respondentCount})` : '';
        return this.createNotification({
            projectId,
            category: 'CAMPAIGN',
            severity: 'INFO',
            title: 'Survey Response Intake Recorded',
            message: `A validated survey response was received for survey "${surveyId}"${campaignId ? ` under campaign "${campaignId}"` : ''}.${countText}`,
            actionUrl: `/campaigns`,
            metadata: { surveyId, campaignId, respondentCount },
        });
    }
    async notifyCampaignLaunched(projectId, campaignId, campaignTitle, totalTargeted) {
        const targetText = totalTargeted ? ` targeting ${totalTargeted} respondents` : '';
        return this.createNotification({
            projectId,
            recipientRole: auth_middleware_1.UserRole.ORG_ADMIN,
            category: 'CAMPAIGN',
            severity: 'SUCCESS',
            title: `Campaign Launched: ${campaignTitle}`,
            message: `Survey campaign "${campaignTitle}" has officially launched${targetText}. Live telemetry and intake is active.`,
            actionUrl: '/campaigns',
            metadata: { campaignId, campaignTitle, totalTargeted },
        });
    }
    async notifySurveyPublished(projectId, surveyId, surveyTitle, version) {
        const vText = version ? ` (v${version})` : '';
        return this.createNotification({
            projectId,
            category: 'CAMPAIGN',
            severity: 'SUCCESS',
            title: `Survey Published: ${surveyTitle}`,
            message: `Survey instrument "${surveyTitle}"${vText} is approved, sealed, and ready for campaign distribution.`,
            actionUrl: '/surveys',
            metadata: { surveyId, surveyTitle, version },
        });
    }
    async notifyExecutiveWorkshopCreated(projectId, workshopTitle, consultantLead) {
        return this.createNotification({
            projectId,
            recipientRole: auth_middleware_1.UserRole.CONSULTANT,
            category: 'CAMPAIGN',
            severity: 'INFO',
            title: `Executive Workshop Scheduled: ${workshopTitle}`,
            message: `Strategy debrief workshop "${workshopTitle}" has been scheduled with facilitator ${consultantLead || 'Consultant'}.`,
            actionUrl: '/consultant/workshops',
            metadata: { workshopTitle, consultantLead },
        });
    }
    async notifySentimentAnomaly(projectId, nodeName, dropPercent, actionUrl = '/ai-analytics') {
        return this.createNotification({
            projectId,
            recipientRole: auth_middleware_1.UserRole.CONSULTANT,
            category: 'AI_ANOMALY',
            severity: 'CRITICAL',
            title: `AI Sentiment Anomaly Detected in ${nodeName}`,
            message: `Negative sentiment divergence of -${dropPercent.toFixed(1)}% detected by NLP scanner in ${nodeName}. Immediate investigation recommended.`,
            actionUrl,
            metadata: { nodeName, dropPercent },
        });
    }
    async notifyCampaignMilestone(projectId, campaignTitle, quorumPercent, actionUrl = '/campaigns') {
        return this.createNotification({
            projectId,
            recipientRole: auth_middleware_1.UserRole.ORG_ADMIN,
            category: 'CAMPAIGN',
            severity: 'SUCCESS',
            title: `Campaign Quorum Milestone: ${quorumPercent}% Reached`,
            message: `Survey campaign "${campaignTitle}" has officially reached ${quorumPercent}% participation quorum.`,
            actionUrl,
            metadata: { campaignTitle, quorumPercent },
        });
    }
    async notifyReportReady(projectId, recipientUserId, reportTitle, downloadUrl = '/reports') {
        return this.createNotification({
            projectId,
            recipientUserId,
            category: 'REPORT',
            severity: 'INFO',
            title: 'Executive Report Compiled & Ready',
            message: `Your requested export "${reportTitle}" has finished asynchronous compilation and is ready for download.`,
            actionUrl: downloadUrl,
            metadata: { reportTitle },
        });
    }
    async notifyHrisSync(projectId, recordsSynced, recordsUpdated) {
        return this.createNotification({
            projectId,
            recipientRole: auth_middleware_1.UserRole.HR_MANAGER,
            category: 'HRIS',
            severity: 'INFO',
            title: 'HRIS Directory Delta Sync Complete',
            message: `Automated organizational directory sync validated ${recordsSynced} active profiles (${recordsUpdated} updated).`,
            actionUrl: '/employees',
            metadata: { recordsSynced, recordsUpdated },
        });
    }
    async notifyComplianceViolation(projectId, details) {
        return this.createNotification({
            projectId,
            recipientRole: auth_middleware_1.UserRole.ORG_ADMIN,
            category: 'COMPLIANCE',
            severity: 'WARNING',
            title: 'Differential Privacy Protection Triggered',
            message: details || 'Query blocked to prevent respondent de-anonymization (N < 5 threshold enforced).',
            actionUrl: '/audit-logs',
            metadata: { details },
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map