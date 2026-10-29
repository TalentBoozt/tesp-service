export interface IStorageService {
    uploadArtifact(key: string, buffer: Buffer, contentType: string): Promise<string>;
    getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
    getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<{
        uploadUrl: string;
        assetUrl: string;
    }>;
    getArtifactBuffer(key: string): Promise<Buffer | null>;
    deleteArtifact(key: string): Promise<void>;
    hasArtifact(key: string): Promise<boolean>;
}
export declare class StorageService implements IStorageService {
    private static instance;
    private bucket;
    private region;
    private endpoint?;
    private accountId?;
    private publicUrl?;
    private accessKeyId?;
    private secretAccessKey?;
    private localFallbackDir;
    constructor(options?: {
        bucket?: string;
        region?: string;
        endpoint?: string;
        accountId?: string;
        publicUrl?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        localFallbackDir?: string;
    });
    static getInstance(): StorageService;
    static resetInstance(): void;
    /**
     * Determine the target Cloudflare R2 / S3 host for SigV4 signing and requests.
     * Virtual-hosted style: <bucket>.<accountId>.r2.cloudflarestorage.com
     * If no accountId: <bucket>.r2.cloudflarestorage.com
     */
    getHost(): string;
    /**
     * Upload an artifact buffer to Cloudflare R2 / cloud object storage or local disk cache
     * Zero binary buffers are retained in heap memory once written
     */
    uploadArtifact(key: string, buffer: Buffer, contentType: string): Promise<string>;
    /**
     * Generate an authentic, short-lived Cloudflare R2 presigned URL (default 15 minutes = 900s)
     */
    getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
    /**
     * Generate an authentic, short-lived presigned upload URL for direct client Cloudflare R2 PUT
     */
    getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number): Promise<{
        uploadUrl: string;
        assetUrl: string;
    }>;
    getArtifactBuffer(key: string): Promise<Buffer | null>;
    hasArtifact(key: string): Promise<boolean>;
    deleteArtifact(key: string): Promise<void>;
    private normalizeKey;
    private buildSigV4Headers;
}
