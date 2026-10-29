"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsGateway = void 0;
class TwilioSmsGateway {
    accountSid;
    authToken;
    fromNumber;
    constructor(config) {
        this.accountSid = config?.accountSid || process.env.TWILIO_ACCOUNT_SID;
        this.authToken = config?.authToken || process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = config?.fromNumber || process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
    }
    isConfigured() {
        return Boolean(this.accountSid && this.authToken && this.fromNumber);
    }
    async sendSms(to, message) {
        if (!this.isConfigured()) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('MISSING_CHANNEL_CONFIG: Twilio SMS credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) not configured');
            }
            console.warn(`[WARN] Twilio SMS gateway unconfigured. Skipping SMS to ${to}`);
            return { success: false, status: 'SKIPPED_NO_CREDENTIALS' };
        }
        try {
            const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
            const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
            const body = new URLSearchParams({
                To: to,
                From: this.fromNumber,
                Body: message,
            });
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });
            const data = (await response.json());
            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || `Twilio SMS dispatch failed with status ${response.status}`,
                    status: 'FAILED',
                };
            }
            return {
                success: true,
                messageId: data.sid,
                status: data.status || 'SENT',
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || 'Twilio network request failed',
                status: 'FAILED',
            };
        }
    }
    async sendWhatsApp(to, message) {
        const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        const whatsappFrom = this.fromNumber?.startsWith('whatsapp:')
            ? this.fromNumber
            : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || this.fromNumber}`;
        if (!this.isConfigured()) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('MISSING_CHANNEL_CONFIG: Twilio WhatsApp credentials not configured');
            }
            console.warn(`[WARN] Twilio WhatsApp gateway unconfigured. Skipping WhatsApp to ${to}`);
            return { success: false, status: 'SKIPPED_NO_CREDENTIALS' };
        }
        try {
            const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
            const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
            const body = new URLSearchParams({
                To: whatsappTo,
                From: whatsappFrom,
                Body: message,
            });
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });
            const data = (await response.json());
            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || `Twilio WhatsApp dispatch failed with status ${response.status}`,
                    status: 'FAILED',
                };
            }
            return {
                success: true,
                messageId: data.sid,
                status: data.status || 'SENT',
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || 'Twilio WhatsApp network request failed',
                status: 'FAILED',
            };
        }
    }
}
exports.TwilioSmsGateway = TwilioSmsGateway;
//# sourceMappingURL=twilio-sms.gateway.js.map