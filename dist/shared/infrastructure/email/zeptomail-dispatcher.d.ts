import { ZeptoMailRegion } from '../../../modules/project-config/domain/value-objects/email-config.vo';
export interface ZeptoMailRecipient {
    email: string;
    name?: string;
}
export interface ZeptoMailSendRequest {
    fromAddress: string;
    fromName: string;
    to: ZeptoMailRecipient[];
    subject: string;
    htmlBody: string;
    replyTo?: string;
    apiKey: string;
    region?: ZeptoMailRegion;
}
export interface ZeptoMailSendResult {
    success: boolean;
    messageId?: string;
    statusCode: number;
    responseBody?: any;
    error?: string;
    provider: 'ZOHO_ZEPTOMAIL_CPAAS';
}
export declare class ZeptoMailDispatcher {
    private static REGION_ENDPOINTS;
    /**
     * Resolves the target API endpoint according to the configured region.
     */
    static getEndpoint(region?: ZeptoMailRegion): string;
    /**
     * Dispatches transactional survey invitations or alerts via Zoho ZeptoMail CPaaS.
     */
    sendMail(req: ZeptoMailSendRequest): Promise<ZeptoMailSendResult>;
}
