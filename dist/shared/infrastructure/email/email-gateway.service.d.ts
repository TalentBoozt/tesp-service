import { IEmailConfigProps } from '../../../modules/project-config/domain/value-objects/email-config.vo';
export interface EmailDispatchOptions {
    projectId: string;
    to: {
        email: string;
        name?: string;
    }[];
    subject: string;
    htmlBody: string;
    replyTo?: string;
    overrideConfig?: Partial<IEmailConfigProps>;
}
export interface GatewaySendResult {
    success: boolean;
    messageId?: string;
    provider: string;
    detail: string;
    error?: string;
    diagnostics?: {
        step: string;
        status: 'PASS' | 'FAIL';
        message: string;
    }[];
}
export declare class EmailGatewayService {
    private zeptoDispatcher;
    private smtpDispatcher;
    /**
     * Dispatches email using the tenant's configured provider.
     */
    dispatch(options: EmailDispatchOptions): Promise<GatewaySendResult>;
    /**
     * Tests connection and sends a diagnostic verification email to a recipient.
     */
    testDiagnosticConnection(projectId: string, targetRecipient: string, customConfig?: Partial<IEmailConfigProps>): Promise<GatewaySendResult>;
}
export declare const emailGatewayService: EmailGatewayService;
