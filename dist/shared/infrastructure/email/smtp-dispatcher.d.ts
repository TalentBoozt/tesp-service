import { EmailProviderType } from '../../../modules/project-config/domain/value-objects/email-config.vo';
export interface SmtpSendRequest {
    provider: EmailProviderType;
    fromAddress: string;
    fromName: string;
    to: {
        email: string;
        name?: string;
    }[];
    subject: string;
    htmlBody: string;
    replyTo?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    useTls?: boolean;
}
export interface SmtpSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    provider: EmailProviderType;
}
export declare class SmtpDispatcher {
    /**
     * Resolves connection options based on provider type and custom parameters.
     */
    static resolveTransportConfig(req: SmtpSendRequest): {
        host: string;
        port: number;
        secure: boolean;
        auth?: {
            user: string;
            pass: string;
        };
    };
    /**
     * Sends an email via SMTP.
     */
    sendMail(req: SmtpSendRequest): Promise<SmtpSendResult>;
    /**
     * Performs an SMTP handshake and authentication check without sending email.
     */
    verifyConnection(req: SmtpSendRequest): Promise<{
        success: boolean;
        message: string;
    }>;
}
