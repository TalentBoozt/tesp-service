"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNS_CERT_URL_PATTERN = void 0;
exports.clearSnsCertCache = clearSnsCertCache;
exports.setSnsCertInCache = setSnsCertInCache;
exports.buildSnsCanonicalString = buildSnsCanonicalString;
exports.verifySnsSignature = verifySnsSignature;
exports.verifyTwilioSignature = verifyTwilioSignature;
const crypto_1 = __importDefault(require("crypto"));
exports.SNS_CERT_URL_PATTERN = /^https:\/\/sns\.[a-z0-9-]+\.amazonaws\.com\/SimpleNotificationService-[a-z0-9]+\.pem$/;
// In-memory certificate cache for downloaded AWS SNS X.509 certificates
const snsCertCache = new Map();
function clearSnsCertCache() {
    snsCertCache.clear();
}
function setSnsCertInCache(url, pemCert) {
    snsCertCache.set(url, pemCert);
}
/**
 * Reconstructs the AWS SNS canonical signing string per AWS specification.
 * Fields are written as name, newline, value, newline in deterministic order.
 */
function buildSnsCanonicalString(body) {
    const type = body.Type || 'Notification';
    const lines = [];
    if (type === 'Notification') {
        const fields = ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'];
        for (const field of fields) {
            if (body[field] !== undefined && body[field] !== null) {
                lines.push(field);
                lines.push(String(body[field]));
            }
        }
    }
    else if (type === 'SubscriptionConfirmation' || type === 'UnsubscribeConfirmation') {
        const fields = ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type'];
        for (const field of fields) {
            if (body[field] !== undefined && body[field] !== null) {
                lines.push(field);
                lines.push(String(body[field]));
            }
        }
    }
    else {
        // Custom/generic SNS payload fallback
        const keys = Object.keys(body)
            .filter((k) => !['Signature', 'SignatureVersion', 'SigningCertURL', 'UnsubscribeURL'].includes(k))
            .sort();
        for (const k of keys) {
            if (body[k] !== undefined && body[k] !== null) {
                lines.push(k);
                lines.push(String(body[k]));
            }
        }
    }
    return lines.join('\n') + '\n';
}
/**
 * Cryptographically verifies an inbound AWS SNS / SES webhook message.
 */
async function verifySnsSignature(body) {
    const signingCertUrl = body.SigningCertURL;
    const signature = body.Signature;
    if (!signingCertUrl || !signature) {
        return false;
    }
    // 1. Strict regex assertion on certificate URL to prevent SSRF and cert spoofing
    if (!exports.SNS_CERT_URL_PATTERN.test(signingCertUrl)) {
        return false;
    }
    try {
        // 2. Retrieve certificate from cache or download from trusted AWS host
        let certPem = snsCertCache.get(signingCertUrl);
        if (!certPem) {
            const response = await fetch(signingCertUrl, {
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                return false;
            }
            certPem = await response.text();
            snsCertCache.set(signingCertUrl, certPem);
        }
        // 3. Reconstruct canonical string
        const canonicalString = buildSnsCanonicalString(body);
        // 4. Verify signature using RSA public key from the certificate
        const signatureVersion = String(body.SignatureVersion || '1');
        const algorithm = signatureVersion === '2' ? 'RSA-SHA256' : 'RSA-SHA1';
        const verifier = crypto_1.default.createVerify(algorithm);
        verifier.update(canonicalString, 'utf8');
        return verifier.verify(certPem, signature, 'base64');
    }
    catch {
        return false;
    }
}
/**
 * Cryptographically verifies an inbound Twilio webhook request using HMAC-SHA1.
 */
function verifyTwilioSignature(req, authToken) {
    if (!authToken) {
        return false;
    }
    const twilioSignature = req.headers['x-twilio-signature'];
    if (!twilioSignature) {
        return false;
    }
    try {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const params = req.body || {};
        const sortedKeys = Object.keys(params).sort();
        let data = fullUrl;
        for (const key of sortedKeys) {
            data += key + params[key];
        }
        const expectedSig = crypto_1.default.createHmac('sha1', authToken).update(data, 'utf8').digest('base64');
        const sigBuf = Buffer.from(twilioSignature);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length !== expBuf.length) {
            return false;
        }
        return crypto_1.default.timingSafeEqual(sigBuf, expBuf);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=webhook-signature-verifier.js.map