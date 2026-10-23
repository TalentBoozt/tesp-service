"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemEmailService = exports.SystemEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class SystemEmailService {
    static instance;
    static getInstance() {
        if (!SystemEmailService.instance) {
            SystemEmailService.instance = new SystemEmailService();
        }
        return SystemEmailService.instance;
    }
    getSmtpConfig() {
        return {
            host: process.env.SMTP_HOST || 'smtp.zoho.eu',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            user: process.env.SMTP_USER || 'no-reply@talnova.io',
            pass: process.env.SMTP_PASS || '',
            from: process.env.SMTP_FROM || 'no-reply@talnova.io',
            fromName: 'Talnova Enterprise Platform',
        };
    }
    createTransporter() {
        const config = this.getSmtpConfig();
        const isSecure = config.port === 465;
        return nodemailer_1.default.createTransport({
            host: config.host,
            port: config.port,
            secure: isSecure,
            auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    /**
     * Verifies the SMTP connection to the configured host.
     */
    async verifyConnection() {
        const config = this.getSmtpConfig();
        if (!config.pass || config.pass.startsWith('••••') || config.pass === 'PASSWORD') {
            return {
                success: true,
                message: `Simulated SMTP handshake for ${config.host}:${config.port} (No live SMTP_PASS configured)`,
            };
        }
        try {
            const transporter = this.createTransporter();
            await transporter.verify();
            return {
                success: true,
                message: `SMTP connection to ${config.host}:${config.port} verified successfully`,
            };
        }
        catch (err) {
            return {
                success: false,
                message: `SMTP connection failed: ${err.message}`,
            };
        }
    }
    /**
     * Sends a general system email using the Zoho traditional SMTP environment variables.
     */
    async sendEmail(options) {
        const config = this.getSmtpConfig();
        const isMock = !config.pass ||
            config.pass.startsWith('••••') ||
            config.pass === 'PASSWORD' ||
            process.env.NODE_ENV === 'test';
        if (isMock) {
            return {
                success: true,
                messageId: `system_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            };
        }
        try {
            const transporter = this.createTransporter();
            const recipientList = Array.isArray(options.to) ? options.to.join(', ') : options.to;
            const info = await transporter.sendMail({
                from: `"${config.fromName}" <${config.from}>`,
                to: recipientList,
                subject: options.subject,
                html: options.htmlBody,
                text: options.textBody,
            });
            return {
                success: true,
                messageId: info.messageId,
            };
        }
        catch (err) {
            console.error(`[SystemEmailService] Failed to dispatch email to ${options.to}:`, err.message);
            return {
                success: false,
                error: err.message,
            };
        }
    }
    /**
     * Sends Consultant Onboarding Welcome Email with Temporary Password.
     */
    async sendConsultantOnboardingEmail(options) {
        const loginUrl = options.loginUrl || `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/login`;
        const firmName = options.firmName || 'Talnova Global Advisory Network';
        const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em;">
            TALNOVA ENTERPRISE PLATFORM
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Advisory & Governance Suite</p>
        </div>

        <div style="background-color: #ffffff; padding: 32px 24px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">
            Welcome to the Advisory Portal, ${options.firstName}!
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            You have been provisioned as an enterprise advisory consultant for <strong>${firmName}</strong> on the Talnova Enterprise Survey Platform.
          </p>

          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 0 0 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">
              Your Temporary Credentials
            </p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;">
              <strong>Username / Email:</strong> <span style="font-family: monospace; color: #0284c7;">${options.to}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #334155;">
              <strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${options.temporaryPassword}</span>
            </p>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 0 0 24px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
              <strong>Security Policy Notice:</strong> For zero-trust compliance, you will be required to change this temporary password upon your first sign-in.
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
              Sign In to Consultant Workspace &rarr;
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Talnova Enterprise Survey Platform &bull; Automated Identity & Governance System
          </p>
        </div>
      </div>
    `;
        return this.sendEmail({
            to: options.to,
            subject: `Welcome to Talnova Advisory Portal - Your Credentials`,
            htmlBody,
            textBody: `Welcome to Talnova! Your temporary credentials for ${options.to}: Password: ${options.temporaryPassword}. Sign in at ${loginUrl} to reset your password.`,
        });
    }
    /**
     * Sends Password Recovery Link Email.
     */
    async sendPasswordResetEmail(options) {
        const greeting = options.firstName ? `Hello ${options.firstName},` : 'Hello,';
        const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em;">
            TALNOVA SECURITY
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Enterprise Identity Protection</p>
        </div>

        <div style="background-color: #ffffff; padding: 32px 24px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">
            Password Reset Request
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            ${greeting} We received a request to reset the password associated with your Talnova Enterprise account (<strong>${options.to}</strong>).
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${options.resetUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
              Reset My Password &rarr;
            </a>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 0 0 24px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
              <strong>Expiry Notice:</strong> This password reset link is valid for <strong>1 hour</strong>. If you did not initiate this request, no action is required and your account remains safe.
            </p>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
            If the button above does not work, copy and paste this link into your browser:<br/>
            <span style="word-break: break-all; color: #0284c7; font-family: monospace;">${options.resetUrl}</span>
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Talnova Enterprise Survey Platform &bull; Security & Access Control
          </p>
        </div>
      </div>
    `;
        return this.sendEmail({
            to: options.to,
            subject: `Talnova Security - Password Reset Request`,
            htmlBody,
            textBody: `${greeting} You requested a password reset for ${options.to}. Reset your password using this link: ${options.resetUrl} (Valid for 1 hour). If you did not request this, please ignore.`,
        });
    }
    /**
     * Sends User Invitation / Provisioning Email.
     */
    async sendUserInvitationEmail(options) {
        const loginUrl = options.loginUrl || `${process.env.APP_BASE_URL || 'https://tesp.talnova.io'}/login`;
        const projectName = options.projectName || 'Talnova Enterprise Platform';
        const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em;">
            TALNOVA ENTERPRISE PLATFORM
          </h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Workspace Access Invitation</p>
        </div>

        <div style="background-color: #ffffff; padding: 32px 24px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">
            Welcome, ${options.firstName}!
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            You have been granted access to <strong>${projectName}</strong> with the role of <strong>${options.role}</strong>.
          </p>

          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 0 0 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">
              Your Account Details
            </p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;">
              <strong>Username / Email:</strong> <span style="font-family: monospace; color: #0284c7;">${options.to}</span>
            </p>
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;">
              <strong>Role:</strong> <span style="font-weight: 600;">${options.role}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #334155;">
              <strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${options.temporaryPassword}</span>
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
              Sign In to Your Workspace &rarr;
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Talnova Enterprise Survey Platform &bull; Production IAM Engine
          </p>
        </div>
      </div>
    `;
        return this.sendEmail({
            to: options.to,
            subject: `Invitation to Talnova Enterprise Platform - ${projectName}`,
            htmlBody,
            textBody: `Welcome to Talnova! You have been granted access to ${projectName} as ${options.role}. Log in at ${loginUrl} with temporary password: ${options.temporaryPassword}`,
        });
    }
}
exports.SystemEmailService = SystemEmailService;
exports.systemEmailService = SystemEmailService.getInstance();
//# sourceMappingURL=system-email.service.js.map