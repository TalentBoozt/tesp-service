export interface SmsSendResult {
    success: boolean;
    messageId?: string;
    status?: string;
    error?: string;
}
export declare class TwilioSmsGateway {
    private accountSid;
    private authToken;
    private fromNumber;
    constructor(config?: {
        accountSid?: string;
        authToken?: string;
        fromNumber?: string;
    });
    isConfigured(): boolean;
    sendSms(to: string, message: string): Promise<SmsSendResult>;
    sendWhatsApp(to: string, message: string): Promise<SmsSendResult>;
}
