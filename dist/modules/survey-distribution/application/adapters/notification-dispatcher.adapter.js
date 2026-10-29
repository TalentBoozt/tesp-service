"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcherAdapter = void 0;
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const email_gateway_service_1 = require("../../../../shared/infrastructure/email/email-gateway.service");
const twilio_sms_gateway_1 = require("../../infrastructure/gateways/twilio-sms.gateway");
const slack_webhook_gateway_1 = require("../../infrastructure/gateways/slack-webhook.gateway");
const teams_webhook_gateway_1 = require("../../infrastructure/gateways/teams-webhook.gateway");
const BATCH_SIZE = 25;
class NotificationDispatcherAdapter {
    twilioGateway;
    slackGateway;
    teamsGateway;
    constructor(twilioGateway = new twilio_sms_gateway_1.TwilioSmsGateway(), slackGateway = new slack_webhook_gateway_1.SlackWebhookGateway(), teamsGateway = new teams_webhook_gateway_1.TeamsWebhookGateway()) {
        this.twilioGateway = twilioGateway;
        this.slackGateway = slackGateway;
        this.teamsGateway = teamsGateway;
    }
    async dispatchCampaignInvitations(req) {
        const channelBreakdown = {};
        for (const channel of req.channels) {
            channelBreakdown[channel] = req.recipients.length;
        }
        let providerUsed = 'SIMULATED';
        let detail = 'Dispatched successfully';
        const providers = [];
        let sentCount = 0;
        let failedCount = 0;
        // 1. EMAIL Channel - Chunked asynchronous batch dispatch (GAP-010)
        if (req.channels.includes(campaign_entity_1.DistributionChannel.EMAIL)) {
            const emailRecipients = req.recipients.filter((r) => r.email && r.surveyUrl);
            if (emailRecipients.length > 0) {
                for (let i = 0; i < emailRecipients.length; i += BATCH_SIZE) {
                    const chunk = emailRecipients.slice(i, i + BATCH_SIZE);
                    const results = await Promise.allSettled(chunk.map(async (recipient) => {
                        const personalizedUrl = recipient.surveyUrl;
                        const htmlBody = `
              <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; margin-bottom: 12px;">${req.title}</h2>
                <p>You have been invited to participate in a confidential organizational survey.</p>
                <div style="margin: 24px 0;">
                  <a href="${personalizedUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Start Confidential Survey
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">
                  Your response is protected by Talnova Enterprise confidentiality protocols.
                </p>
              </div>
            `;
                        return email_gateway_service_1.emailGatewayService.dispatch({
                            projectId: req.projectId,
                            to: [
                                {
                                    email: recipient.email,
                                    name: recipient.employeeId ? `Employee ${recipient.employeeId}` : undefined,
                                },
                            ],
                            subject: req.title,
                            htmlBody,
                        });
                    }));
                    for (const res of results) {
                        if (res.status === 'fulfilled' && res.value.success) {
                            sentCount++;
                            providerUsed = res.value.provider;
                            detail = res.value.detail;
                            if (!providers.includes(res.value.provider)) {
                                providers.push(res.value.provider);
                            }
                        }
                        else {
                            failedCount++;
                        }
                    }
                }
            }
        }
        // 2. SMS Channel - Chunked asynchronous batch dispatch (GAP-010)
        if (req.channels.includes(campaign_entity_1.DistributionChannel.SMS)) {
            const smsRecipients = req.recipients.filter((r) => r.phone && r.surveyUrl);
            for (let i = 0; i < smsRecipients.length; i += BATCH_SIZE) {
                const chunk = smsRecipients.slice(i, i + BATCH_SIZE);
                const results = await Promise.allSettled(chunk.map(async (recipient) => {
                    const smsText = `Confidential Survey: ${req.title}\nPlease complete your response here: ${recipient.surveyUrl}`;
                    return this.twilioGateway.sendSms(recipient.phone, smsText);
                }));
                for (const res of results) {
                    if (res.status === 'fulfilled' && res.value.success) {
                        sentCount++;
                        if (!providers.includes('TWILIO_SMS')) {
                            providers.push('TWILIO_SMS');
                        }
                    }
                    else {
                        failedCount++;
                    }
                }
            }
        }
        // 3. SLACK Channel - Webhook Anonymity Guard & Single Channel Announcement (GAP-011)
        if (req.channels.includes(campaign_entity_1.DistributionChannel.SLACK)) {
            const genericPortalUrl = `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/surveys/${req.surveyId}/portal`;
            const slackDescription = `📢 Survey Announcement: *${req.title}*\nUnique survey invitation links have been emailed to all eligible participants. Please check your inbox or access the survey portal.`;
            const slackResult = await this.slackGateway.sendSurveyNotification(req.title, genericPortalUrl, { description: slackDescription });
            if (slackResult.success) {
                sentCount++;
                providers.push('SLACK_WEBHOOK');
            }
            else {
                failedCount++;
            }
        }
        // 4. TEAMS Channel - Webhook Anonymity Guard & Single Channel Announcement (GAP-011)
        if (req.channels.includes(campaign_entity_1.DistributionChannel.TEAMS)) {
            const genericPortalUrl = `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/surveys/${req.surveyId}/portal`;
            const teamsDescription = `📢 Survey Announcement: ${req.title}\nUnique survey invitation links have been emailed to all eligible participants. Please check your inbox or access the survey portal.`;
            const teamsResult = await this.teamsGateway.sendSurveyNotification(req.title, genericPortalUrl, { description: teamsDescription });
            if (teamsResult.success) {
                sentCount++;
                providers.push('TEAMS_WEBHOOK');
            }
            else {
                failedCount++;
            }
        }
        if (providers.length > 0) {
            providerUsed = providers.join('+');
        }
        return {
            totalDispatched: req.recipients.length * req.channels.length,
            sentCount,
            failedCount,
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
        const providers = [];
        let sentCount = 0;
        let failedCount = 0;
        // 1. EMAIL Reminders - Chunked asynchronous batch dispatch (GAP-010)
        if (channels.includes(campaign_entity_1.DistributionChannel.EMAIL)) {
            const emailRecipients = uncompletedRecipients.filter((r) => r.email && r.surveyUrl);
            if (emailRecipients.length > 0) {
                for (let i = 0; i < emailRecipients.length; i += BATCH_SIZE) {
                    const chunk = emailRecipients.slice(i, i + BATCH_SIZE);
                    const results = await Promise.allSettled(chunk.map(async (recipient) => {
                        const personalizedUrl = recipient.surveyUrl;
                        const htmlBody = `
              <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #f59e0b; margin-bottom: 12px;">Survey Reminder: Your Voice Matters</h2>
                <p>This is a friendly reminder to complete your confidential feedback survey before the campaign closes.</p>
                <div style="margin: 24px 0;">
                  <a href="${personalizedUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Complete Survey Now
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">
                  Your feedback is anonymous and directly shapes organizational improvements.
                </p>
              </div>
            `;
                        return email_gateway_service_1.emailGatewayService.dispatch({
                            projectId,
                            to: [{ email: recipient.email }],
                            subject: 'Reminder: Complete Your Confidential Survey',
                            htmlBody,
                        });
                    }));
                    for (const res of results) {
                        if (res.status === 'fulfilled' && res.value.success) {
                            sentCount++;
                            providerUsed = res.value.provider;
                            detail = res.value.detail;
                            if (!providers.includes(res.value.provider)) {
                                providers.push(res.value.provider);
                            }
                        }
                        else {
                            failedCount++;
                        }
                    }
                }
            }
        }
        // 2. SMS Reminders - Chunked asynchronous batch dispatch (GAP-010)
        if (channels.includes(campaign_entity_1.DistributionChannel.SMS)) {
            const smsRecipients = uncompletedRecipients.filter((r) => r.phone && r.surveyUrl);
            for (let i = 0; i < smsRecipients.length; i += BATCH_SIZE) {
                const chunk = smsRecipients.slice(i, i + BATCH_SIZE);
                const results = await Promise.allSettled(chunk.map(async (recipient) => {
                    const smsText = `Survey Reminder: Please complete your confidential survey before it expires:\n${recipient.surveyUrl}`;
                    return this.twilioGateway.sendSms(recipient.phone, smsText);
                }));
                for (const res of results) {
                    if (res.status === 'fulfilled' && res.value.success) {
                        sentCount++;
                        if (!providers.includes('TWILIO_SMS')) {
                            providers.push('TWILIO_SMS');
                        }
                    }
                    else {
                        failedCount++;
                    }
                }
            }
        }
        // 3. SLACK Reminders - Webhook Anonymity Guard (GAP-011)
        if (channels.includes(campaign_entity_1.DistributionChannel.SLACK)) {
            const genericPortalUrl = `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/surveys/reminders/portal`;
            const slackResult = await this.slackGateway.sendSurveyNotification('Reminder: Complete Your Confidential Survey', genericPortalUrl, {
                description: '📢 Survey Reminder: This is a friendly reminder to complete your confidential feedback survey before the campaign closes. Please check your email for your personalized link.',
            });
            if (slackResult.success) {
                sentCount++;
                providers.push('SLACK_WEBHOOK');
            }
            else {
                failedCount++;
            }
        }
        // 4. TEAMS Reminders - Webhook Anonymity Guard (GAP-011)
        if (channels.includes(campaign_entity_1.DistributionChannel.TEAMS)) {
            const genericPortalUrl = `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/surveys/reminders/portal`;
            const teamsResult = await this.teamsGateway.sendSurveyNotification('Reminder: Complete Your Confidential Survey', genericPortalUrl, {
                description: '📢 Survey Reminder: This is a friendly reminder to complete your confidential feedback survey before the campaign closes. Please check your email for your personalized link.',
            });
            if (teamsResult.success) {
                sentCount++;
                providers.push('TEAMS_WEBHOOK');
            }
            else {
                failedCount++;
            }
        }
        if (providers.length > 0) {
            providerUsed = providers.join('+');
        }
        return {
            totalDispatched: uncompletedRecipients.length * channels.length,
            sentCount,
            failedCount,
            channelBreakdown,
            success: true,
            providerUsed,
            detail,
        };
    }
}
exports.NotificationDispatcherAdapter = NotificationDispatcherAdapter;
//# sourceMappingURL=notification-dispatcher.adapter.js.map