"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackWebhookGateway = void 0;
class SlackWebhookGateway {
    defaultWebhookUrl;
    constructor(defaultWebhookUrl) {
        this.defaultWebhookUrl = defaultWebhookUrl || process.env.SLACK_WEBHOOK_URL;
    }
    isConfigured() {
        return Boolean(this.defaultWebhookUrl && this.defaultWebhookUrl.trim().length > 0);
    }
    async sendSurveyNotification(surveyTitle, surveyUrl, options) {
        const targetUrl = options?.webhookUrl || this.defaultWebhookUrl;
        if (!targetUrl) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('MISSING_CHANNEL_CONFIG: Slack webhook URL (SLACK_WEBHOOK_URL) not configured');
            }
            console.warn('[WARN] Slack webhook gateway unconfigured. Skipping Slack dispatch.');
            return { success: false, status: 'SKIPPED_NO_CREDENTIALS' };
        }
        const payload = {
            text: `${surveyTitle}: ${surveyUrl}`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: surveyTitle.slice(0, 150),
                        emoji: true,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: options?.description || 'You have been invited to participate in a confidential organizational survey. Your feedback directly shapes company culture.',
                    },
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Start Survey',
                                emoji: true,
                            },
                            url: surveyUrl,
                            style: 'primary',
                        },
                    ],
                },
            ],
        };
        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const text = await response.text();
                return {
                    success: false,
                    error: `Slack webhook call failed: ${text || response.statusText}`,
                    status: 'FAILED',
                };
            }
            return {
                success: true,
                status: 'DELIVERED',
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || 'Slack webhook request error',
                status: 'FAILED',
            };
        }
    }
}
exports.SlackWebhookGateway = SlackWebhookGateway;
//# sourceMappingURL=slack-webhook.gateway.js.map