export interface SystemEmailOptions {
    to: string | string[];
    subject: string;
    htmlBody: string;
    textBody?: string;
}
export interface ConsultantOnboardingEmailOptions {
    to: string;
    firstName: string;
    lastName?: string;
    temporaryPassword: string;
    firmName?: string;
    loginUrl?: string;
}
export interface PasswordResetEmailOptions {
    to: string;
    firstName?: string;
    resetToken: string;
    resetUrl: string;
}
export interface UserInvitationEmailOptions {
    to: string;
    firstName: string;
    role: string;
    projectName?: string;
    temporaryPassword: string;
    loginUrl?: string;
}
export declare class SystemEmailService {
    private static instance;
    static getInstance(): SystemEmailService;
    getSmtpConfig(): {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
        fromName: string;
    };
    private createTransporter;
    /**
     * Verifies the SMTP connection to the configured host.
     */
    verifyConnection(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Sends a general system email using the Zoho traditional SMTP environment variables.
     */
    sendEmail(options: SystemEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Sends Consultant Onboarding Welcome Email with Temporary Password.
     */
    sendConsultantOnboardingEmail(options: ConsultantOnboardingEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Sends Password Recovery Link Email.
     */
    sendPasswordResetEmail(options: PasswordResetEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Sends User Invitation / Provisioning Email.
     */
    sendUserInvitationEmail(options: UserInvitationEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
export declare const systemEmailService: SystemEmailService;
