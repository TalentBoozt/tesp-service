"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcherAdapter = void 0;
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const email_gateway_service_1 = require("../../../../shared/infrastructure/email/email-gateway.service");
class NotificationDispatcherAdapter {
    async dispatchCampaignInvitations(req) {
        const channelBreakdown = {};
        for (const channel of req.channels) {
            channelBreakdown[channel] = req.recipients.length;
        }
        let providerUsed = 'SIMULATED';
        let detail = 'Dispatched successfully';
        // If EMAIL channel is included and recipients have emails, dispatch via EmailGatewayService
        if (req.channels.includes(campaign_entity_1.DistributionChannel.EMAIL)) {
            const emailRecipients = req.recipients
                .filter((r) => r.email)
                .map((r) => ({
                email: r.email,
                name: r.employeeId ? `Employee ${r.employeeId}` : undefined,
            }));
            if (emailRecipients.length > 0) {
                const firstRecipient = req.recipients.find((r) => r.email);
                const sampleUrl = firstRecipient ? firstRecipient.surveyUrl : (process.env.APP_BASE_URL || 'https://tesp.talnova.io');
                const htmlBody = `
          <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #4f46e5; margin-bottom: 12px;">${req.title}</h2>
            <p>You have been invited to participate in a confidential organizational survey.</p>
            <div style="margin: 24px 0;">
              <a href="${sampleUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Confidential Survey
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              Your response is protected by Talnova Enterprise confidentiality protocols.
            </p>
          </div>
        `;
                const gatewayResult = await email_gateway_service_1.emailGatewayService.dispatch({
                    projectId: req.projectId,
                    to: emailRecipients,
                    subject: req.title,
                    htmlBody,
                });
                providerUsed = gatewayResult.provider;
                detail = gatewayResult.detail;
            }
        }
        return {
            totalDispatched: req.recipients.length * req.channels.length,
            channelBreakdown,
            success: true,
            providerUsed,
            detail,
        };
    }
    async dispatchReminders(projectId, campaignId, channels, uncompletedRecipients) {
        const channelBreakdown = {};
        for (const channel of channels) {
            channelBreakdown[channel] = uncompletedRecipients.length;
        }
        let providerUsed = 'SIMULATED';
        let detail = 'Reminders dispatched';
        if (channels.includes(campaign_entity_1.DistributionChannel.EMAIL)) {
            const emailRecipients = uncompletedRecipients
                .filter((r) => r.email)
                .map((r) => ({ email: r.email }));
            if (emailRecipients.length > 0) {
                const sampleUrl = uncompletedRecipients[0]?.surveyUrl || (process.env.APP_BASE_URL || 'https://tesp.talnova.io');
                const htmlBody = `
          <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #f59e0b; margin-bottom: 12px;">Survey Reminder: Your Voice Matters</h2>
            <p>This is a friendly reminder to complete your confidential feedback survey before the campaign closes.</p>
            <div style="margin: 24px 0;">
              <a href="${sampleUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Complete Survey Now
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              Your feedback is anonymous and directly shapes organizational improvements.
            </p>
          </div>
        `;
                const gatewayResult = await email_gateway_service_1.emailGatewayService.dispatch({
                    projectId,
                    to: emailRecipients,
                    subject: 'Reminder: Complete Your Confidential Survey',
                    htmlBody,
                });
                providerUsed = gatewayResult.provider;
                detail = gatewayResult.detail;
            }
        }
        return {
            totalDispatched: uncompletedRecipients.length * channels.length,
            channelBreakdown,
            success: true,
            providerUsed,
            detail,
        };
    }
}
exports.NotificationDispatcherAdapter = NotificationDispatcherAdapter;
//# sourceMappingURL=notification-dispatcher.adapter.js.map