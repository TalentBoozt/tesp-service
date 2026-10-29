"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldEncryptionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Enterprise Field-Level Encryption Service (AES-256-GCM) with HMAC-SHA256 Blind Indexing
 * Implements CSFLE (Client-Side Field Level Encryption) for Employee PII (GAP-010 / FEAT-003).
 */
class FieldEncryptionService {
    static CIPHER_ALGORITHM = 'aes-256-gcm';
    static IV_LENGTH = 12; // 96 bits recommended for GCM
    static TAG_LENGTH = 16; // 128 bits auth tag
    static CIPHERTEXT_REGEX = /^[0-9a-fA-F]{24}:[0-9a-fA-F]{32}:[0-9a-fA-F]+$/;
    static getEncryptionKey() {
        const rawKey = process.env.FIELD_ENCRYPTION_KEY || 'tesp-field-encryption-master-secret-2026';
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.FIELD_ENCRYPTION_KEY || process.env.FIELD_ENCRYPTION_KEY === 'tesp-field-encryption-master-secret-2026') {
                throw new Error('Fatal: FIELD_ENCRYPTION_KEY must be configured with a secure 32+ char key in production.');
            }
        }
        return crypto_1.default.createHash('sha256').update(rawKey, 'utf8').digest();
    }
    static getBlindIndexKey() {
        const rawKey = process.env.BLIND_INDEX_KEY || 'tesp-blind-index-hmac-secret-2026';
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.BLIND_INDEX_KEY || process.env.BLIND_INDEX_KEY === 'tesp-blind-index-hmac-secret-2026') {
                throw new Error('Fatal: BLIND_INDEX_KEY must be configured with a secure 32+ char key in production.');
            }
        }
        return crypto_1.default.createHash('sha256').update(rawKey, 'utf8').digest();
    }
    /**
     * Checks whether a given string is serialized ciphertext format: iv:tag:ciphertext
     */
    static isEncrypted(value) {
        if (!value || typeof value !== 'string')
            return false;
        return this.CIPHERTEXT_REGEX.test(value);
    }
    /**
     * Encrypts plaintext using AES-256-GCM.
     * Produces serialized format: {ivHex}:{authTagHex}:{ciphertextHex}
     */
    static encrypt(plaintext) {
        if (plaintext === undefined || plaintext === null || plaintext === '') {
            return '';
        }
        if (this.isEncrypted(plaintext)) {
            return plaintext;
        }
        const key = this.getEncryptionKey();
        const iv = crypto_1.default.randomBytes(this.IV_LENGTH);
        const cipher = crypto_1.default.createCipheriv(this.CIPHER_ALGORITHM, key, iv, {
            authTagLength: this.TAG_LENGTH,
        });
        const ciphertext = Buffer.concat([
            cipher.update(String(plaintext), 'utf8'),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
    }
    /**
     * Decrypts AES-256-GCM ciphertext.
     * If input is unencrypted (e.g., legacy or mock data), returns input unchanged.
     */
    static decrypt(encryptedText) {
        if (!encryptedText || typeof encryptedText !== 'string') {
            return '';
        }
        if (!this.isEncrypted(encryptedText)) {
            return encryptedText;
        }
        try {
            const [ivHex, tagHex, cipherHex] = encryptedText.split(':');
            const key = this.getEncryptionKey();
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const ciphertext = Buffer.from(cipherHex, 'hex');
            const decipher = crypto_1.default.createDecipheriv(this.CIPHER_ALGORITHM, key, iv, {
                authTagLength: this.TAG_LENGTH,
            });
            decipher.setAuthTag(tag);
            const decrypted = Buffer.concat([
                decipher.update(ciphertext),
                decipher.final(),
            ]);
            return decrypted.toString('utf8');
        }
        catch (err) {
            // In case of tampering or corruption, log and return original or empty
            console.error('[FieldEncryptionService] Decryption failed:', err);
            return encryptedText;
        }
    }
    /**
     * Generates a deterministic HMAC-SHA256 blind index for exact-match equality queries on PII.
     */
    static blindIndex(value) {
        if (!value || typeof value !== 'string') {
            return '';
        }
        const normalized = value.trim().toLowerCase();
        const key = this.getBlindIndexKey();
        return crypto_1.default.createHmac('sha256', key).update(normalized, 'utf8').digest('hex');
    }
    /**
     * Alias for blindIndex method.
     */
    static createBlindIndex(value) {
        return this.blindIndex(value);
    }
    /**
     * Alias for blindIndex method.
     */
    static generateBlindIndex(value) {
        return this.blindIndex(value);
    }
}
exports.FieldEncryptionService = FieldEncryptionService;
//# sourceMappingURL=field-encryption.service.js.map