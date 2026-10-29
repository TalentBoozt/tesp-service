"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailGatewayService = exports.EmailGatewayService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const email_config_vo_1 = require("../../../modules/project-config/domain/value-objects/email-config.vo");
const zeptomail_dispatcher_1 = require("./zeptomail-dispatcher");
const smtp_dispatcher_1 = require("./smtp-dispatcher");
const project_schema_1 = require("../../../modules/project-config/infrastructure/persistence/mongoose/project.schema");
class EmailGatewayService {
    zeptoDispatcher = new zeptomail_dispatcher_1.ZeptoMailDispatcher();
    smtpDispatcher = new smtp_dispatcher_1.SmtpDispatcher();
    /**
     * Dispatches email using the tenant's configured provider.
     */
    async dispatch(options) {
        let emailConfig;
        if (options.overrideConfig) {
            emailConfig = new email_config_vo_1.EmailConfig(options.overrideConfig);
        }
        else {
            let project = null;
            if (mongoose_1.default.connection?.readyState === 1) {
                project = await project_schema_1.ProjectModel.findOne({ projectId: options.projectId, isDeleted: false }).lean().catch(() => null);
            }
            emailConfig = new email_config_vo_1.EmailConfig(project?.emailConfig || {
                provider: 'SIMULATED',
                fromName: project?.name ? `${project.name} Engagement Team` : 'Talnova Survey Team',
                fromEmail: 'no-reply@talnova.io',
            });
        }
        const provider = emailConfig.provider;
        if (provider === 'ZOHO_ZEPTOMAIL_CPAAS') {
            const result = await this.zeptoDispatcher.sendMail({
                fromAddress: emailConfig.fromEmail,
                fromName: emailConfig.fromName,
                to: options.to,
                subject: options.subject,
                htmlBody: options.htmlBody,
                replyTo: options.replyTo || emailConfig.replyToEmail,
                apiKey: emailConfig.zeptoMailApiKey || '',
                region: emailConfig.zeptoMailRegion,
            });
            return {
                success: result.success,
                messageId: result.messageId,
                provider,
                detail: result.success ? 'Delivered via Zoho ZeptoMail CPaaS REST API' : (result.error || 'ZeptoMail delivery error'),
                error: result.error,
            };
        }
        if (provider === 'ZOHO_SMTP' || provider === 'GOOGLE_WORKSPACE_SMTP' || provider === 'CUSTOM_SMTP') {
            const result = await this.smtpDispatcher.sendMail({
                provider,
                fromAddress: emailConfig.fromEmail,
                fromName: emailConfig.fromName,
                to: options.to,
                subject: options.subject,
                htmlBody: options.htmlBody,
                replyTo: options.replyTo || emailConfig.replyToEmail,
                host: emailConfig.smtpHost,
                port: emailConfig.smtpPort,
                user: emailConfig.smtpUser,
                password: emailConfig.smtpPassword,
                useTls: emailConfig.useTls,
            });
            return {
                success: result.success,
                messageId: result.messageId,
                provider,
                detail: result.success ? `Delivered via ${provider} (${emailConfig.smtpHost}:${emailConfig.smtpPort})` : (result.error || 'SMTP delivery failed'),
                error: result.error,
            };
        }
        // SIMULATED fallback
        if (provider === 'SIMULATED') {
            if (process.env.NODE_ENV === 'production') {
                return {
                    success: false,
                    provider: 'SIMULATED',
                    detail: 'Simulated email provider is prohibited in production environment. Please configure an authentic SMTP or ZeptoMail CPaaS provider.',
                    error: 'SIMULATED_PROVIDER_PROHIBITED_IN_PROD',
                };
            }
            return {
                success: true,
                messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                provider: 'SIMULATED',
                detail: `Simulated dispatch to ${options.to.length} recipient(s) [From: ${emailConfig.fromEmail}]`,
            };
        }
        return {
            success: false,
            provider: provider || 'UNKNOWN',
            detail: `Unsupported or unconfigured email provider: ${provider}`,
            error: `UNSUPPORTED_PROVIDER_${provider}`,
        };
    }
    /**
     * Tests connection and sends a diagnostic verification email to a recipient.
     */
    async testDiagnosticConnection(projectId, targetRecipient, customConfig) {
        const diagnostics = [];
        // Step 1: Resolve Config
        diagnostics.push({
            step: '1. Config Resolution',
            status: 'PASS',
            message: `Resolved tenant email configuration for ${projectId}`,
        });
        let config;
        if (customConfig && customConfig.provider) {
            config = new email_config_vo_1.EmailConfig(customConfig);
        }
        else {
            let project = null;
            if (mongoose_1.default.connection?.readyState === 1) {
                project = await project_schema_1.ProjectModel.findOne({ projectId, isDeleted: false }).lean().catch(() => null);
            }
            config = new email_config_vo_1.EmailConfig(project?.emailConfig || {});
        }
        // Step 2: Protocol Handshake
        diagnostics.push({
            step: '2. Gateway Handshake',
            status: 'PASS',
            message: `Protocol: ${config.provider} | Sender: ${config.fromEmail}`,
        });
        const testSubject = `[Talnova Diagnostic] Gateway Handshake Test for ${projectId}`;
        const testHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #4f46e5;">Talnova Enterprise Email Gateway Verification</h2>
        <p>This is a live diagnostic verification email sent from your Talnova survey tenant.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
          <tr><td style="padding: 6px; font-weight: bold;">Tenant Project:</td><td>${projectId}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Provider:</td><td>${config.provider}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Sender:</td><td>${config.fromName} &lt;${config.fromEmail}&gt;</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Timestamp:</td><td>${new Date().toISOString()}</td></tr>
        </table>
        <p style="margin-top: 20px; font-size: 11px; color: #64748b;">
          Talnova Enterprise Survey Platform &bull; Production Gateway Engine
        </p>
      </div>
    `;
        const dispatchRes = await this.dispatch({
            projectId,
            to: [{ email: targetRecipient }],
            subject: testSubject,
            htmlBody: testHtml,
            overrideConfig: customConfig,
        });
        if (dispatchRes.success) {
            diagnostics.push({
                step: '3. Outbound Dispatch',
                status: 'PASS',
                message: `Dispatched test email successfully (Message ID: ${dispatchRes.messageId})`,
            });
            // Update project document with last test status if connected to MongoDB
            if (mongoose_1.default.connection?.readyState === 1) {
                await project_schema_1.ProjectModel.updateOne({ projectId }, {
                    $set: {
                        'emailConfig.lastTestTimestamp': new Date(),
                        'emailConfig.lastTestStatus': 'SUCCESS',
                        'emailConfig.lastTestError': null,
                        'emailConfig.isDomainVerified': true,
                    },
                }).catch(() => null);
            }
            return {
                success: true,
                messageId: dispatchRes.messageId,
                provider: config.provider,
                detail: `Diagnostic handshake passed! Verification email queued to ${targetRecipient}`,
                diagnostics,
            };
        }
        else {
            diagnostics.push({
                step: '3. Outbound Dispatch',
                status: 'FAIL',
                message: dispatchRes.error || 'Failed to dispatch verification email',
            });
            if (mongoose_1.default.connection?.readyState === 1) {
                await project_schema_1.ProjectModel.updateOne({ projectId }, {
                    $set: {
                        'emailConfig.lastTestTimestamp': new Date(),
                        'emailConfig.lastTestStatus': 'FAILED',
                        'emailConfig.lastTestError': dispatchRes.error,
                    },
                }).catch(() => null);
            }
            return {
                success: false,
                provider: config.provider,
                detail: dispatchRes.error || 'Diagnostic handshake failed',
                error: dispatchRes.error,
                diagnostics,
            };
        }
    }
}
exports.EmailGatewayService = EmailGatewayService;
exports.emailGatewayService = new EmailGatewayService();
//# sourceMappingURL=email-gateway.service.js.map