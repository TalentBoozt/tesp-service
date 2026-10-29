/**
 * Enterprise Field-Level Encryption Service (AES-256-GCM) with HMAC-SHA256 Blind Indexing
 * Implements CSFLE (Client-Side Field Level Encryption) for Employee PII (GAP-010 / FEAT-003).
 */
export declare class FieldEncryptionService {
    private static readonly CIPHER_ALGORITHM;
    private static readonly IV_LENGTH;
    private static readonly TAG_LENGTH;
    private static readonly CIPHERTEXT_REGEX;
    private static getEncryptionKey;
    private static getBlindIndexKey;
    /**
     * Checks whether a given string is serialized ciphertext format: iv:tag:ciphertext
     */
    static isEncrypted(value?: string | null): boolean;
    /**
     * Encrypts plaintext using AES-256-GCM.
     * Produces serialized format: {ivHex}:{authTagHex}:{ciphertextHex}
     */
    static encrypt(plaintext?: string | null): string;
    /**
     * Decrypts AES-256-GCM ciphertext.
     * If input is unencrypted (e.g., legacy or mock data), returns input unchanged.
     */
    static decrypt(encryptedText?: string | null): string;
    /**
     * Generates a deterministic HMAC-SHA256 blind index for exact-match equality queries on PII.
     */
    static blindIndex(value?: string | null): string;
    /**
     * Alias for blindIndex method.
     */
    static createBlindIndex(value?: string | null): string;
    /**
     * Alias for blindIndex method.
     */
    static generateBlindIndex(value?: string | null): string;
}
