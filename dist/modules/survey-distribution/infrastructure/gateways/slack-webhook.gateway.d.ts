export interface SlackNotificationResult {
    success: boolean;
    status?: string;
    error?: string;
}
export declare class SlackWebhookGateway {
    private defaultWebhookUrl;
    constructor(defaultWebhookUrl?: string);
    isConfigured(): boolean;
    sendSurveyNotification(surveyTitle: string, surveyUrl: string, options?: {
        webhookUrl?: string;
        description?: string;
    }): Promise<SlackNotificationResult>;
}
