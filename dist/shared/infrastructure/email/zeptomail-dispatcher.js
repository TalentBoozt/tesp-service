"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeptoMailDispatcher = void 0;
class ZeptoMailDispatcher {
    static REGION_ENDPOINTS = {
        US: 'https://api.zeptomail.com/v1.1/email',
        EU: 'https://api.zeptomail.eu/v1.1/email',
        IN: 'https://api.zeptomail.in/v1.1/email',
        AU: 'https://api.zeptomail.com.au/v1.1/email',
    };
    /**
     * Resolves the target API endpoint according to the configured region.
     */
    static getEndpoint(region = 'US') {
        return this.REGION_ENDPOINTS[region] || this.REGION_ENDPOINTS.US;
    }
    /**
     * Dispatches transactional survey invitations or alerts via Zoho ZeptoMail CPaaS.
     */
    async sendMail(req) {
        const region = req.region || 'US';
        const endpoint = ZeptoMailDispatcher.getEndpoint(region);
        // If apiKey is a placeholder, simulated, or missing in test environments, simulate delivery
        const isMock = !req.apiKey || req.apiKey.startsWith('mock') || req.apiKey.startsWith('••••') || req.apiKey.includes('placeholder');
        if (isMock) {
            return {
                success: true,
                messageId: `zm_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                statusCode: 200,
                responseBody: {
                    data: [{ code: 'SUCCESS', message: 'Simulated Zoho ZeptoMail CPaaS dispatch' }],
                    message: 'Email request simulated successfully',
                },
                provider: 'ZOHO_ZEPTOMAIL_CPAAS',
            };
        }
        const payload = {
            from: {
                address: req.fromAddress,
                name: req.fromName,
            },
            to: req.to.map((recipient) => ({
                email_address: {
                    address: recipient.email,
                    name: recipient.name || recipient.email.split('@')[0],
                },
            })),
            subject: req.subject,
            htmlbody: req.htmlBody,
        };
        if (req.replyTo) {
            payload.reply_to = [
                {
                    address: req.replyTo,
                },
            ];
        }
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Zoho-enczapikey ${req.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const responseData = await response.json().catch(() => null);
            if (!response.ok) {
                const errorDetail = responseData?.error?.message || responseData?.message || `HTTP ${response.status} ${response.statusText}`;
                return {
                    success: false,
                    statusCode: response.status,
                    responseBody: responseData,
                    error: `ZeptoMail API Error: ${errorDetail}`,
                    provider: 'ZOHO_ZEPTOMAIL_CPAAS',
                };
            }
            const messageId = responseData?.data?.[0]?.message_id || `zm_${Date.now()}`;
            return {
                success: true,
                messageId,
                statusCode: response.status,
                responseBody: responseData,
                provider: 'ZOHO_ZEPTOMAIL_CPAAS',
            };
        }
        catch (err) {
            return {
                success: false,
                statusCode: 500,
                error: `Network failure connecting to ZeptoMail gateway: ${err.message}`,
                provider: 'ZOHO_ZEPTOMAIL_CPAAS',
            };
        }
    }
}
exports.ZeptoMailDispatcher = ZeptoMailDispatcher;
//# sourceMappingURL=zeptomail-dispatcher.js.map