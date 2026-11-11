"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStyleTokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const field_encryption_service_1 = require("../../../../shared/infrastructure/security/field-encryption.service");
/**
 * Cryptographic token service for Social Styles public respondent links.
 * - Generates 256-bit (32-byte) URL-safe base64url tokens.
 * - Computes SHA-256 hashes for indexed database lookup (never stores plaintext tokens).
 * - Encrypts the raw token via AES-256-GCM (FieldEncryptionService) so the owning consultant
 *   can copy the active URL without exposing plaintext in MongoDB.
 */
class SocialStyleTokenService {
    static TOKEN_BYTES = 32; // 256 bits of cryptographic entropy
    static MIN_TOKEN_LENGTH = 32;
    static MAX_TOKEN_LENGTH = 128;
    static BASE64URL_REGEX = /^[A-Za-z0-9_-]{32,128}$/;
    baseAppUrl;
    constructor(baseAppUrl) {
        this.baseAppUrl = (baseAppUrl ||
            process.env.PUBLIC_APP_URL ||
            process.env.FRONTEND_URL ||
            'https://tesp.talnova.io').replace(/\/+$/, '');
    }
    /**
     * Generates a new 256-bit cryptographically random token, its SHA-256 hash,
     * its AES-256-GCM encrypted representation, and the full public respondent URL.
     */
    generateTokenBundle(expiresAt) {
        if (expiresAt && expiresAt.getTime() <= Date.now()) {
            throw new Error('tokenExpiresAt must be a future timestamp.');
        }
        const rawToken = crypto_1.default
            .randomBytes(SocialStyleTokenService.TOKEN_BYTES)
            .toString('base64url');
        const publicTokenHash = this.hashToken(rawToken);
        const encryptedPublicToken = field_encryption_service_1.FieldEncryptionService.encrypt(rawToken);
        const publicUrl = this.buildPublicUrl(rawToken);
        return {
            rawToken,
            publicTokenHash,
            encryptedPublicToken,
            publicUrl,
            ...(expiresAt ? { tokenExpiresAt: expiresAt } : {}),
        };
    }
    /**
     * Computes the deterministic SHA-256 hex digest of a raw public token.
     */
    hashToken(rawToken) {
        if (!this.isWellFormedToken(rawToken)) {
            throw new Error('Malformed public token format.');
        }
        return crypto_1.default.createHash('sha256').update(rawToken.trim(), 'utf8').digest('hex');
    }
    /**
     * Checks whether a candidate string matches the expected base64url 256-bit token shape.
     */
    isWellFormedToken(rawToken) {
        if (!rawToken || typeof rawToken !== 'string')
            return false;
        return SocialStyleTokenService.BASE64URL_REGEX.test(rawToken.trim());
    }
    /**
     * Decrypts an AES-256-GCM encrypted token stored on an active assessment and builds its public URL.
     * Returns null if no encrypted token is stored (e.g., after submission or revocation).
     */
    reconstructPublicUrlFromEncrypted(encryptedPublicToken) {
        if (!encryptedPublicToken)
            return null;
        const rawToken = field_encryption_service_1.FieldEncryptionService.decrypt(encryptedPublicToken);
        if (!rawToken || !this.isWellFormedToken(rawToken)) {
            return null;
        }
        return this.buildPublicUrl(rawToken);
    }
    /**
     * Builds the canonical public respondent URL for a raw token.
     */
    buildPublicUrl(rawToken) {
        return `${this.baseAppUrl}/social-styles/public/${rawToken.trim()}`;
    }
    /**
     * Generates a compact 128-bit (16-byte, 22-char base64url) token bundle for Classroom QR Sessions
     * so the resulting URL is short (~62 chars) and renders as a low-density, easy-to-scan QR matrix
     * from across a classroom or lecture hall.
     */
    generateQrSessionTokenBundle() {
        const rawSessionToken = crypto_1.default.randomBytes(16).toString('base64url');
        const sessionTokenHash = this.hashQrSessionToken(rawSessionToken);
        const encryptedSessionToken = field_encryption_service_1.FieldEncryptionService.encrypt(rawSessionToken);
        const joinUrl = this.buildQrJoinUrl(rawSessionToken);
        return {
            rawSessionToken,
            sessionTokenHash,
            encryptedSessionToken,
            joinUrl,
        };
    }
    isWellFormedQrSessionToken(rawToken) {
        if (!rawToken || typeof rawToken !== 'string')
            return false;
        return /^[A-Za-z0-9_-]{16,128}$/.test(rawToken.trim());
    }
    hashQrSessionToken(rawToken) {
        if (!this.isWellFormedQrSessionToken(rawToken)) {
            throw new Error('Malformed QR session token format.');
        }
        return crypto_1.default.createHash('sha256').update(rawToken.trim(), 'utf8').digest('hex');
    }
    buildQrJoinUrl(rawSessionToken) {
        return `${this.baseAppUrl}/social-styles/join/${rawSessionToken.trim()}`;
    }
    reconstructQrJoinUrlFromEncrypted(encryptedSessionToken) {
        if (!encryptedSessionToken)
            return null;
        const rawToken = field_encryption_service_1.FieldEncryptionService.decrypt(encryptedSessionToken);
        if (!rawToken || !this.isWellFormedQrSessionToken(rawToken)) {
            return null;
        }
        return this.buildQrJoinUrl(rawToken);
    }
    decryptRawToken(encryptedToken) {
        if (!encryptedToken)
            return null;
        return field_encryption_service_1.FieldEncryptionService.decrypt(encryptedToken) || null;
    }
    /**
     * Constant-time verification of a raw token against a stored hash and lifecycle state.
     */
    validateTokenAgainstAssessmentState(rawToken, assessmentState, now = new Date()) {
        if (!this.isWellFormedToken(rawToken)) {
            return { valid: false, reason: 'MALFORMED_TOKEN' };
        }
        if (assessmentState.status === 'REVOKED' || assessmentState.tokenRevokedAt) {
            return { valid: false, reason: 'TOKEN_REVOKED' };
        }
        if (assessmentState.status === 'COMPLETED' || assessmentState.status === 'REVIEWED') {
            return { valid: false, reason: 'ASSESSMENT_COMPLETED' };
        }
        if (assessmentState.status === 'CANCELLED') {
            return { valid: false, reason: 'ASSESSMENT_CANCELLED' };
        }
        if (assessmentState.status === 'EXPIRED') {
            return { valid: false, reason: 'TOKEN_EXPIRED' };
        }
        if (assessmentState.tokenExpiresAt) {
            const expiryMs = new Date(assessmentState.tokenExpiresAt).getTime();
            if (!Number.isNaN(expiryMs) && now.getTime() > expiryMs) {
                return { valid: false, reason: 'TOKEN_EXPIRED' };
            }
        }
        if (!assessmentState.publicTokenHash) {
            return { valid: false, reason: 'TOKEN_HASH_MISMATCH' };
        }
        const candidateHash = this.hashToken(rawToken);
        const expectedBuf = Buffer.from(assessmentState.publicTokenHash, 'hex');
        const candidateBuf = Buffer.from(candidateHash, 'hex');
        if (expectedBuf.length !== candidateBuf.length ||
            !crypto_1.default.timingSafeEqual(expectedBuf, candidateBuf)) {
            return { valid: false, reason: 'TOKEN_HASH_MISMATCH' };
        }
        return { valid: true, publicTokenHash: candidateHash };
    }
}
exports.SocialStyleTokenService = SocialStyleTokenService;
//# sourceMappingURL=social-style-token.service.js.map