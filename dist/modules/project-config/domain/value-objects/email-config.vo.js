"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConfig = void 0;
class EmailConfig {
    static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    provider;
    fromName;
    fromEmail;
    replyToEmail;
    zeptoMailApiKey;
    zeptoMailRegion;
    smtpHost;
    smtpPort;
    smtpUser;
    smtpPassword;
    useTls;
    dailySendLimit;
    isDomainVerified;
    lastTestTimestamp;
    lastTestStatus;
    lastTestError;
    constructor(props) {
        const provider = props?.provider || 'SIMULATED';
        const validProviders = [
            'ZOHO_ZEPTOMAIL_CPAAS',
            'ZOHO_SMTP',
            'GOOGLE_WORKSPACE_SMTP',
            'CUSTOM_SMTP',
            'SIMULATED',
        ];
        if (!validProviders.includes(provider)) {
            throw new Error(`Invalid email provider '${provider}'. Supported: ${validProviders.join(', ')}`);
        }
        const fromEmail = props?.fromEmail ? props.fromEmail.trim().toLowerCase() : 'no-reply@talnova.io';
        if (!EmailConfig.EMAIL_REGEX.test(fromEmail)) {
            throw new Error(`Invalid fromEmail format: '${fromEmail}'`);
        }
        if (props?.replyToEmail && props.replyToEmail.trim().length > 0) {
            const replyTo = props.replyToEmail.trim().toLowerCase();
            if (!EmailConfig.EMAIL_REGEX.test(replyTo)) {
                throw new Error(`Invalid replyToEmail format: '${props.replyToEmail}'`);
            }
            this.replyToEmail = replyTo;
        }
        if (props?.smtpPort !== undefined) {
            if (!Number.isInteger(props.smtpPort) || props.smtpPort < 1 || props.smtpPort > 65535) {
                throw new Error(`Invalid SMTP port: ${props.smtpPort}. Must be between 1 and 65535.`);
            }
            this.smtpPort = props.smtpPort;
        }
        else if (provider === 'ZOHO_SMTP') {
            this.smtpPort = 465;
        }
        else if (provider === 'GOOGLE_WORKSPACE_SMTP') {
            this.smtpPort = 587;
        }
        this.provider = provider;
        this.fromName = (props?.fromName || 'Talnova Survey Team').trim();
        this.fromEmail = fromEmail;
        this.zeptoMailApiKey = props?.zeptoMailApiKey;
        this.zeptoMailRegion = props?.zeptoMailRegion || 'US';
        this.smtpHost = props?.smtpHost || (provider === 'ZOHO_SMTP' ? 'smtp.zoho.com' : provider === 'GOOGLE_WORKSPACE_SMTP' ? 'smtp.gmail.com' : undefined);
        this.smtpUser = props?.smtpUser;
        this.smtpPassword = props?.smtpPassword;
        this.useTls = props?.useTls ?? (provider === 'ZOHO_SMTP' || provider === 'GOOGLE_WORKSPACE_SMTP');
        this.dailySendLimit = props?.dailySendLimit ?? (provider === 'ZOHO_ZEPTOMAIL_CPAAS' ? 50000 : 1000);
        this.isDomainVerified = props?.isDomainVerified ?? false;
        this.lastTestTimestamp = props?.lastTestTimestamp;
        this.lastTestStatus = props?.lastTestStatus;
        this.lastTestError = props?.lastTestError;
    }
    static createDefault(clientName, defaultFromEmail) {
        return new EmailConfig({
            provider: 'SIMULATED',
            fromName: clientName ? `${clientName} Engagement Team` : 'Talnova Engagement Advisory',
            fromEmail: defaultFromEmail || 'no-reply@talnova.io',
            dailySendLimit: 1000,
            useTls: true,
            isDomainVerified: true,
        });
    }
    toJSON() {
        return {
            provider: this.provider,
            fromName: this.fromName,
            fromEmail: this.fromEmail,
            replyToEmail: this.replyToEmail,
            zeptoMailApiKey: this.zeptoMailApiKey,
            zeptoMailRegion: this.zeptoMailRegion,
            smtpHost: this.smtpHost,
            smtpPort: this.smtpPort,
            smtpUser: this.smtpUser,
            smtpPassword: this.smtpPassword,
            useTls: this.useTls,
            dailySendLimit: this.dailySendLimit,
            isDomainVerified: this.isDomainVerified,
            lastTestTimestamp: this.lastTestTimestamp,
            lastTestStatus: this.lastTestStatus,
            lastTestError: this.lastTestError,
        };
    }
    toMaskedJSON() {
        return {
            ...this.toJSON(),
            zeptoMailApiKey: this.zeptoMailApiKey ? '••••••••' + this.zeptoMailApiKey.slice(-4) : undefined,
            smtpPassword: this.smtpPassword ? '••••••••' : undefined,
        };
    }
}
exports.EmailConfig = EmailConfig;
//# sourceMappingURL=email-config.vo.js.map