"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsWebhookGateway = void 0;
class TeamsWebhookGateway {
    defaultWebhookUrl;
    constructor(defaultWebhookUrl) {
        this.defaultWebhookUrl = defaultWebhookUrl || process.env.TEAMS_WEBHOOK_URL;
    }
    isConfigured() {
        return Boolean(this.defaultWebhookUrl && this.defaultWebhookUrl.trim().length > 0);
    }
    async sendSurveyNotification(surveyTitle, surveyUrl, options) {
        const targetUrl = options?.webhookUrl || this.defaultWebhookUrl;
        if (!targetUrl) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('MISSING_CHANNEL_CONFIG: Microsoft Teams webhook URL (TEAMS_WEBHOOK_URL) not configured');
            }
            console.warn('[WARN] Microsoft Teams webhook gateway unconfigured. Skipping Teams dispatch.');
            return { success: false, status: 'SKIPPED_NO_CREDENTIALS' };
        }
        const payload = {
            '@type': 'MessageCard',
            '@context': 'https://schema.org/extensions',
            summary: surveyTitle,
            themeColor: '4F46E5',
            title: surveyTitle,
            text: options?.description || 'You have been invited to participate in a confidential organizational survey. Your feedback directly shapes our organization.',
            potentialAction: [
                {
                    '@type': 'OpenUri',
                    name: 'Start Survey',
                    targets: [
                        {
                            os: 'default',
                            uri: surveyUrl,
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
                    error: `Teams webhook call failed: ${text || response.statusText}`,
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
                error: err.message || 'Teams webhook request error',
                status: 'FAILED',
            };
        }
    }
}
exports.TeamsWebhookGateway = TeamsWebhookGateway;
//# sourceMappingURL=teams-webhook.gateway.js.map