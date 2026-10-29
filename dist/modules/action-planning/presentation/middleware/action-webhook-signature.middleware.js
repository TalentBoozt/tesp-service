"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActionWebhookSecret = getActionWebhookSecret;
exports.computeActionWebhookHmac = computeActionWebhookHmac;
exports.verifyActionWebhookSignatureMiddleware = verifyActionWebhookSignatureMiddleware;
const crypto_1 = __importDefault(require("crypto"));
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
/**
 * Returns the configured webhook secret for Jira/Planner inbound integrations.
 */
function getActionWebhookSecret() {
    return (process.env.JIRA_WEBHOOK_SECRET ||
        process.env.PLANNER_WEBHOOK_SECRET ||
        process.env.ACTION_WEBHOOK_SECRET ||
        process.env.WEBHOOK_SECRET ||
        process.env.JWT_SECRET ||
        'tesp-action-webhook-default-secret-2026');
}
/**
 * Computes HMAC-SHA256 digest for incoming action webhook payloads.
 */
function computeActionWebhookHmac(payload, secret) {
    const sec = secret || getActionWebhookSecret();
    const rawPayload = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    return crypto_1.default.createHmac('sha256', sec).update(rawPayload).digest('hex');
}
/**
 * Cryptographic HMAC signature verification middleware for Jira and Microsoft Planner webhooks (GAP-002).
 * Rejects missing or invalid signatures with HTTP 401 Unauthorized.
 */
function verifyActionWebhookSignatureMiddleware(req, _res, next) {
    // Allow explicit test bypass in non-production environments when requested
    if (process.env.NODE_ENV !== 'production' && req.headers['x-bypass-webhook-verification'] === 'true') {
        return next();
    }
    const signatureHeader = req.headers['x-hub-signature-256'] ||
        req.headers['x-hub-signature'] ||
        req.headers['x-atlassian-webhook-signature'] ||
        req.headers['x-webhook-signature'];
    const clientStateHeader = req.headers['client-state'] ||
        req.headers['x-ms-client-state'] ||
        req.headers['x-webhook-secret'];
    const secret = getActionWebhookSecret();
    // Support Microsoft Graph Client-State token validation
    if (clientStateHeader && clientStateHeader === secret) {
        return next();
    }
    if (!signatureHeader && !clientStateHeader) {
        return next(new error_middleware_1.AppError(401, 'Unauthorized: Webhook signature header is absent', 'https://tesp-api.talnova.io/errors/unauthorized'));
    }
    if (!signatureHeader) {
        return next(new error_middleware_1.AppError(401, 'Unauthorized: Webhook signature is invalid', 'https://tesp-api.talnova.io/errors/unauthorized'));
    }
    const cleanSig = signatureHeader.replace(/^sha256=/, '').trim();
    const expectedHex = computeActionWebhookHmac(req.body, secret);
    try {
        const bufA = Buffer.from(cleanSig, 'hex');
        const bufB = Buffer.from(expectedHex, 'hex');
        if (bufA.length > 0 && bufA.length === bufB.length && crypto_1.default.timingSafeEqual(bufA, bufB)) {
            return next();
        }
    }
    catch {
        // Malformed hex or length mismatch handled below
    }
    return next(new error_middleware_1.AppError(401, 'Unauthorized: Webhook signature is invalid', 'https://tesp-api.talnova.io/errors/unauthorized'));
}
//# sourceMappingURL=action-webhook-signature.middleware.js.map