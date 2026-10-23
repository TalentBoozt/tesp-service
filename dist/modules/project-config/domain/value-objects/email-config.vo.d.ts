export type EmailProviderType = 'ZOHO_ZEPTOMAIL_CPAAS' | 'ZOHO_SMTP' | 'GOOGLE_WORKSPACE_SMTP' | 'CUSTOM_SMTP' | 'SIMULATED';
export type ZeptoMailRegion = 'US' | 'EU' | 'IN' | 'AU';
export interface IEmailConfigProps {
    provider: EmailProviderType;
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
    zeptoMailApiKey?: string;
    zeptoMailRegion?: ZeptoMailRegion;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    useTls?: boolean;
    dailySendLimit?: number;
    isDomainVerified?: boolean;
    lastTestTimestamp?: Date;
    lastTestStatus?: 'SUCCESS' | 'FAILED';
    lastTestError?: string;
}
export declare class EmailConfig {
    private static EMAIL_REGEX;
    readonly provider: EmailProviderType;
    readonly fromName: string;
    readonly fromEmail: string;
    readonly replyToEmail?: string;
    readonly zeptoMailApiKey?: string;
    readonly zeptoMailRegion: ZeptoMailRegion;
    readonly smtpHost?: string;
    readonly smtpPort?: number;
    readonly smtpUser?: string;
    readonly smtpPassword?: string;
    readonly useTls: boolean;
    readonly dailySendLimit: number;
    readonly isDomainVerified: boolean;
    readonly lastTestTimestamp?: Date;
    readonly lastTestStatus?: 'SUCCESS' | 'FAILED';
    readonly lastTestError?: string;
    constructor(props?: Partial<IEmailConfigProps>);
    static createDefault(clientName?: string, defaultFromEmail?: string): EmailConfig;
    toJSON(): IEmailConfigProps;
    toMaskedJSON(): IEmailConfigProps;
}
