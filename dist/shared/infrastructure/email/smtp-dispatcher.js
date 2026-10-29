"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpDispatcher = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class SmtpDispatcher {
    /**
     * Resolves connection options based on provider type and custom parameters.
     */
    static resolveTransportConfig(req) {
        let host = req.host || (req.provider === 'ZOHO_SMTP' ? (process.env.SMTP_HOST || 'smtp.zoho.eu') : 'smtp.zoho.eu');
        let port = req.port || (req.provider === 'ZOHO_SMTP' ? parseInt(process.env.SMTP_PORT || '587', 10) : 587);
        let secure = port === 465;
        if (req.provider === 'ZOHO_SMTP') {
            host = req.host || process.env.SMTP_HOST || 'smtp.zoho.eu';
            port = req.port || parseInt(process.env.SMTP_PORT || '587', 10);
            secure = port === 465;
        }
        else if (req.provider === 'GOOGLE_WORKSPACE_SMTP') {
            host = req.host || 'smtp.gmail.com';
            port = req.port || 587;
            secure = port === 465;
        }
        const user = req.user || (req.provider === 'ZOHO_SMTP' ? process.env.SMTP_USER : undefined);
        const pass = req.password || (req.provider === 'ZOHO_SMTP' ? process.env.SMTP_PASS : undefined);
        const auth = user && pass ? { user, pass } : undefined;
        return { host, port, secure, auth };
    }
    /**
     * Sends an email via SMTP.
     */
    async sendMail(req) {
        const effectivePass = req.password || (req.provider === 'ZOHO_SMTP' ? process.env.SMTP_PASS : undefined);
        const effectiveUser = req.user || (req.provider === 'ZOHO_SMTP' ? process.env.SMTP_USER : undefined);
        const isProd = process.env.NODE_ENV === 'production';
        const isMock = !isProd &&
            (process.env.NODE_ENV === 'test' ||
                !effectivePass ||
                effectivePass.startsWith('••••') ||
                effectivePass.startsWith('mock') ||
                !effectiveUser ||
                effectiveUser.includes('mock'));
        if (isProd && (!effectivePass || !effectiveUser || effectivePass.startsWith('••••') || effectivePass.startsWith('mock') || effectiveUser.includes('mock'))) {
            return {
                success: false,
                error: `MISSING_SMTP_CREDENTIALS: SMTP credentials not configured for provider ${req.provider} in production environment`,
                provider: req.provider,
            };
        }
        if (isMock) {
            return {
                success: true,
                messageId: `smtp_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                provider: req.provider,
            };
        }
        const config = SmtpDispatcher.resolveTransportConfig(req);
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: config.auth,
                tls: {
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                        ? true
                        : process.env.SMTP_ALLOW_INSECURE_TLS === 'true'
                            ? false
                            : true,
                },
            });
            const recipientList = req.to.map((r) => (r.name ? `"${r.name}" <${r.email}>` : r.email)).join(', ');
            const info = await transporter.sendMail({
                from: `"${req.fromName}" <${req.fromAddress}>`,
                to: recipientList,
                subject: req.subject,
                html: req.htmlBody,
                replyTo: req.replyTo,
            });
            return {
                success: true,
                messageId: info.messageId,
                provider: req.provider,
            };
        }
        catch (err) {
            return {
                success: false,
                error: `SMTP Dispatch Error: ${err.message}`,
                provider: req.provider,
            };
        }
    }
    /**
     * Performs an SMTP handshake and authentication check without sending email.
     */
    async verifyConnection(req) {
        const effectivePass = req.password || (req.provider === 'ZOHO_SMTP' ? process.env.SMTP_PASS : undefined);
        const effectiveUser = req.user || (req.provider === 'ZOHO_SMTP' ? process.env.SMTP_USER : undefined);
        const isProd = process.env.NODE_ENV === 'production';
        const isMock = !isProd &&
            (process.env.NODE_ENV === 'test' ||
                !effectivePass ||
                effectivePass.startsWith('••••') ||
                effectivePass.startsWith('mock') ||
                !effectiveUser ||
                effectiveUser.includes('mock'));
        if (isProd && (!effectivePass || !effectiveUser || effectivePass.startsWith('••••') || effectivePass.startsWith('mock') || effectiveUser.includes('mock'))) {
            return {
                success: false,
                message: `SMTP Connection failed: Missing or invalid SMTP credentials for provider ${req.provider} in production environment`,
            };
        }
        if (isMock) {
            return {
                success: true,
                message: `Simulated SMTP handshake successful for ${req.host || 'smtp.zoho.eu'}:${req.port || 587}`,
            };
        }
        const config = SmtpDispatcher.resolveTransportConfig(req);
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: config.auth,
                tls: {
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                        ? true
                        : process.env.SMTP_ALLOW_INSECURE_TLS === 'true'
                            ? false
                            : true,
                },
            });
            await transporter.verify();
            return {
                success: true,
                message: `SMTP handshake and authentication verified with ${config.host}:${config.port}`,
            };
        }
        catch (err) {
            return {
                success: false,
                message: `SMTP Connection failed: ${err.message}`,
            };
        }
    }
}
exports.SmtpDispatcher = SmtpDispatcher;
//# sourceMappingURL=smtp-dispatcher.js.map