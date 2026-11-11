export interface GeneratedPublicTokenBundle {
    rawToken: string;
    publicTokenHash: string;
    encryptedPublicToken: string;
    publicUrl: string;
    tokenExpiresAt?: Date;
}
export type PublicTokenValidationOutcome = {
    valid: true;
    publicTokenHash: string;
} | {
    valid: false;
    reason: 'MALFORMED_TOKEN' | 'TOKEN_HASH_MISMATCH' | 'TOKEN_REVOKED' | 'TOKEN_EXPIRED' | 'ASSESSMENT_COMPLETED' | 'ASSESSMENT_CANCELLED';
};
/**
 * Cryptographic token service for Social Styles public respondent links.
 * - Generates 256-bit (32-byte) URL-safe base64url tokens.
 * - Computes SHA-256 hashes for indexed database lookup (never stores plaintext tokens).
 * - Encrypts the raw token via AES-256-GCM (FieldEncryptionService) so the owning consultant
 *   can copy the active URL without exposing plaintext in MongoDB.
 */
export declare class SocialStyleTokenService {
    static readonly TOKEN_BYTES = 32;
    static readonly MIN_TOKEN_LENGTH = 32;
    static readonly MAX_TOKEN_LENGTH = 128;
    private static readonly BASE64URL_REGEX;
    private readonly baseAppUrl;
    constructor(baseAppUrl?: string);
    /**
     * Generates a new 256-bit cryptographically random token, its SHA-256 hash,
     * its AES-256-GCM encrypted representation, and the full public respondent URL.
     */
    generateTokenBundle(expiresAt?: Date): GeneratedPublicTokenBundle;
    /**
     * Computes the deterministic SHA-256 hex digest of a raw public token.
     */
    hashToken(rawToken: string): string;
    /**
     * Checks whether a candidate string matches the expected base64url 256-bit token shape.
     */
    isWellFormedToken(rawToken?: string | null): boolean;
    /**
     * Decrypts an AES-256-GCM encrypted token stored on an active assessment and builds its public URL.
     * Returns null if no encrypted token is stored (e.g., after submission or revocation).
     */
    reconstructPublicUrlFromEncrypted(encryptedPublicToken?: string | null): string | null;
    /**
     * Builds the canonical public respondent URL for a raw token.
     */
    buildPublicUrl(rawToken: string): string;
    /**
     * Generates a compact 128-bit (16-byte, 22-char base64url) token bundle for Classroom QR Sessions
     * so the resulting URL is short (~62 chars) and renders as a low-density, easy-to-scan QR matrix
     * from across a classroom or lecture hall.
     */
    generateQrSessionTokenBundle(): {
        rawSessionToken: string;
        sessionTokenHash: string;
        encryptedSessionToken: string;
        joinUrl: string;
    };
    isWellFormedQrSessionToken(rawToken?: string | null): boolean;
    hashQrSessionToken(rawToken: string): string;
    buildQrJoinUrl(rawSessionToken: string): string;
    reconstructQrJoinUrlFromEncrypted(encryptedSessionToken?: string | null): string | null;
    decryptRawToken(encryptedToken?: string | null): string | null;
    /**
     * Constant-time verification of a raw token against a stored hash and lifecycle state.
     */
    validateTokenAgainstAssessmentState(rawToken: string, assessmentState: {
        publicTokenHash?: string | null;
        status: string;
        tokenExpiresAt?: Date | string | null;
        tokenRevokedAt?: Date | string | null;
    }, now?: Date): PublicTokenValidationOutcome;
}
