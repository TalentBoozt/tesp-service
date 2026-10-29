"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class StorageService {
    static instance;
    bucket;
    region;
    endpoint;
    accountId;
    publicUrl;
    accessKeyId;
    secretAccessKey;
    localFallbackDir;
    constructor(options) {
        this.accountId =
            options?.accountId ||
                process.env.R2_ACCOUNT_ID ||
                process.env.CLOUDFLARE_ACCOUNT_ID;
        this.bucket =
            options?.bucket ||
                process.env.R2_BUCKET ||
                process.env.CLOUDFLARE_R2_BUCKET ||
                process.env.S3_REPORTS_BUCKET ||
                process.env.AWS_S3_BUCKET ||
                'tesp-storage';
        this.region =
            options?.region ||
                process.env.R2_REGION ||
                (this.accountId ? 'auto' : (process.env.AWS_REGION || 'auto'));
        this.publicUrl =
            options?.publicUrl ||
                process.env.R2_PUBLIC_URL ||
                process.env.CLOUDFLARE_R2_PUBLIC_URL;
        this.endpoint =
            options?.endpoint ||
                process.env.R2_ENDPOINT ||
                process.env.CLOUDFLARE_R2_ENDPOINT ||
                process.env.S3_ENDPOINT ||
                (this.accountId ? `https://${this.accountId}.r2.cloudflarestorage.com` : undefined);
        this.accessKeyId =
            options?.accessKeyId ||
                process.env.R2_ACCESS_KEY_ID ||
                process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
                process.env.AWS_ACCESS_KEY_ID;
        this.secretAccessKey =
            options?.secretAccessKey ||
                process.env.R2_SECRET_ACCESS_KEY ||
                process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
                process.env.AWS_SECRET_ACCESS_KEY;
        this.localFallbackDir =
            options?.localFallbackDir ||
                path_1.default.resolve(process.cwd(), 'tmp', 'reports', 'storage');
    }
    static getInstance() {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }
    static resetInstance() {
        StorageService.instance = undefined;
    }
    /**
     * Determine the target Cloudflare R2 / S3 host for SigV4 signing and requests.
     * Virtual-hosted style: <bucket>.<accountId>.r2.cloudflarestorage.com
     * If no accountId: <bucket>.r2.cloudflarestorage.com
     */
    getHost() {
        if (this.accountId) {
            return `${this.bucket}.${this.accountId}.r2.cloudflarestorage.com`;
        }
        if (this.endpoint) {
            try {
                const url = new URL(this.endpoint);
                if (url.host.includes('r2.cloudflarestorage.com')) {
                    return `${this.bucket}.${url.host}`;
                }
                return url.host;
            }
            catch { }
        }
        if (process.env.AWS_S3_BUCKET && !process.env.R2_BUCKET && !process.env.R2_ACCOUNT_ID) {
            return `${this.bucket}.s3.${this.region}.amazonaws.com`;
        }
        return `${this.bucket}.r2.cloudflarestorage.com`;
    }
    /**
     * Upload an artifact buffer to Cloudflare R2 / cloud object storage or local disk cache
     * Zero binary buffers are retained in heap memory once written
     */
    async uploadArtifact(key, buffer, contentType) {
        const cleanKey = this.normalizeKey(key);
        // Write to persistent disk cache for local/testing retrieval
        const targetFile = path_1.default.resolve(this.localFallbackDir, cleanKey);
        const parentDir = path_1.default.dirname(targetFile);
        await fs_1.default.promises.mkdir(parentDir, { recursive: true });
        await fs_1.default.promises.writeFile(targetFile, buffer);
        // If active Cloudflare R2 / S3 credentials are configured, perform HTTP PUT in production
        if (this.accessKeyId && this.secretAccessKey && process.env.NODE_ENV === 'production') {
            try {
                const host = this.getHost();
                const url = `https://${host}/${encodeURI(cleanKey)}`;
                const payloadHash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
                const headers = this.buildSigV4Headers('PUT', cleanKey, contentType, payloadHash);
                await fetch(url, {
                    method: 'PUT',
                    headers: {
                        ...headers,
                        'Content-Length': buffer.length.toString(),
                    },
                    body: new Uint8Array(buffer),
                });
            }
            catch (err) {
                console.warn(`[StorageService] Cloudflare R2 remote upload failed for ${cleanKey}, retained in persistent disk:`, err);
            }
        }
        return `r2://${this.bucket}/${cleanKey}`;
    }
    /**
     * Generate an authentic, short-lived Cloudflare R2 presigned URL (default 15 minutes = 900s)
     */
    async getPresignedDownloadUrl(key, expiresInSeconds = 900) {
        const cleanKey = this.normalizeKey(key);
        const now = new Date();
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const dateStamp = amzDate.substring(0, 8);
        const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
        const host = this.getHost();
        if (!this.accessKeyId || !this.secretAccessKey) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Cloud storage credentials missing: STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY must be configured in production');
            }
        }
        const signingKey = this.secretAccessKey || 'test-secret-key-tesp-enterprise';
        const accessKey = this.accessKeyId || 'AKIAIOSFODNN7EXAMPLE';
        // Canonical request query parameters
        const queryParams = {
            'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
            'X-Amz-Credential': `${accessKey}/${credentialScope}`,
            'X-Amz-Date': amzDate,
            'X-Amz-Expires': expiresInSeconds.toString(),
            'X-Amz-SignedHeaders': 'host',
        };
        const canonicalQuery = Object.keys(queryParams)
            .sort()
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
            .join('&');
        const canonicalHeaders = `host:${host}\n`;
        const canonicalRequest = `GET\n/${encodeURI(cleanKey)}\n${canonicalQuery}\n${canonicalHeaders}\nhost\nUNSIGNED-PAYLOAD`;
        const canonicalHash = crypto_1.default.createHash('sha256').update(canonicalRequest).digest('hex');
        const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalHash}`;
        // Derive AWS SigV4 signing key
        const kDate = crypto_1.default.createHmac('sha256', `AWS4${signingKey}`).update(dateStamp).digest();
        const kRegion = crypto_1.default.createHmac('sha256', kDate).update(this.region).digest();
        const kService = crypto_1.default.createHmac('sha256', kRegion).update('s3').digest();
        const kSigning = crypto_1.default.createHmac('sha256', kService).update('aws4_request').digest();
        const signature = crypto_1.default.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
        return `https://${host}/${encodeURI(cleanKey)}?${canonicalQuery}&X-Amz-Signature=${signature}`;
    }
    /**
     * Generate an authentic, short-lived presigned upload URL for direct client Cloudflare R2 PUT
     */
    async getPresignedUploadUrl(key, contentType, expiresInSeconds = 900) {
        const cleanKey = this.normalizeKey(key);
        const now = new Date();
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const dateStamp = amzDate.substring(0, 8);
        const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
        const host = this.getHost();
        if (!this.accessKeyId || !this.secretAccessKey) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Cloud storage credentials missing: STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY must be configured in production');
            }
        }
        const signingKey = this.secretAccessKey || 'test-secret-key-tesp-enterprise';
        const accessKey = this.accessKeyId || 'AKIAIOSFODNN7EXAMPLE';
        // Canonical request query parameters
        const queryParams = {
            'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
            'X-Amz-Credential': `${accessKey}/${credentialScope}`,
            'X-Amz-Date': amzDate,
            'X-Amz-Expires': expiresInSeconds.toString(),
            'X-Amz-SignedHeaders': 'content-type;host',
        };
        const canonicalQuery = Object.keys(queryParams)
            .sort()
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
            .join('&');
        const canonicalHeaders = `content-type:${contentType.trim()}\nhost:${host}\n`;
        const canonicalRequest = `PUT\n/${encodeURI(cleanKey)}\n${canonicalQuery}\n${canonicalHeaders}\ncontent-type;host\nUNSIGNED-PAYLOAD`;
        const canonicalHash = crypto_1.default.createHash('sha256').update(canonicalRequest).digest('hex');
        const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalHash}`;
        // Derive AWS SigV4 signing key
        const kDate = crypto_1.default.createHmac('sha256', `AWS4${signingKey}`).update(dateStamp).digest();
        const kRegion = crypto_1.default.createHmac('sha256', kDate).update(this.region).digest();
        const kService = crypto_1.default.createHmac('sha256', kRegion).update('s3').digest();
        const kSigning = crypto_1.default.createHmac('sha256', kService).update('aws4_request').digest();
        const signature = crypto_1.default.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
        const uploadUrl = `https://${host}/${encodeURI(cleanKey)}?${canonicalQuery}&X-Amz-Signature=${signature}`;
        const assetUrl = this.publicUrl
            ? `${this.publicUrl.replace(/\/+$/, '')}/${encodeURI(cleanKey)}`
            : `https://${host}/${encodeURI(cleanKey)}`;
        return { uploadUrl, assetUrl };
    }
    async getArtifactBuffer(key) {
        const cleanKey = this.normalizeKey(key);
        const targetFile = path_1.default.resolve(this.localFallbackDir, cleanKey);
        try {
            if (fs_1.default.existsSync(targetFile)) {
                return await fs_1.default.promises.readFile(targetFile);
            }
        }
        catch { }
        return null;
    }
    async hasArtifact(key) {
        const cleanKey = this.normalizeKey(key);
        const targetFile = path_1.default.resolve(this.localFallbackDir, cleanKey);
        return fs_1.default.existsSync(targetFile);
    }
    async deleteArtifact(key) {
        const cleanKey = this.normalizeKey(key);
        const targetFile = path_1.default.resolve(this.localFallbackDir, cleanKey);
        try {
            if (fs_1.default.existsSync(targetFile)) {
                await fs_1.default.promises.unlink(targetFile);
            }
        }
        catch { }
    }
    normalizeKey(key) {
        return key.replace(/^\/+/, '').replace(/^(?:r2|s3):\/\/[^/]+\//, '');
    }
    buildSigV4Headers(method, cleanKey, contentType, payloadHash) {
        const host = this.getHost();
        const now = new Date();
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const dateStamp = amzDate.substring(0, 8);
        const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
        const signingKey = this.secretAccessKey || 'test-secret-key-tesp-enterprise';
        const accessKey = this.accessKeyId || 'AKIAIOSFODNN7EXAMPLE';
        const canonicalHeaders = `content-type:${contentType.trim()}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
        const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
        const canonicalRequest = `${method}\n/${encodeURI(cleanKey)}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
        const canonicalHash = crypto_1.default.createHash('sha256').update(canonicalRequest).digest('hex');
        const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalHash}`;
        const kDate = crypto_1.default.createHmac('sha256', `AWS4${signingKey}`).update(dateStamp).digest();
        const kRegion = crypto_1.default.createHmac('sha256', kDate).update(this.region).digest();
        const kService = crypto_1.default.createHmac('sha256', kRegion).update('s3').digest();
        const kSigning = crypto_1.default.createHmac('sha256', kService).update('aws4_request').digest();
        const signature = crypto_1.default.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
        return {
            'Content-Type': contentType.trim(),
            Host: host,
            'x-amz-date': amzDate,
            'x-amz-content-sha256': payloadHash,
            Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        };
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map