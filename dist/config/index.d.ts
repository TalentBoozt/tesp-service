export declare const config: {
    port: number;
    nodeEnv: string;
    mongoDbUri: string;
    upstashRedisRestUrl: string;
    upstashRedisRestToken: string;
    jwtSecret: string;
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    r2: {
        accountId: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        publicUrl: string;
        endpoint: string;
        region: string;
    };
    security: {
        fieldEncryptionKey: string;
        blindIndexKey: string;
    };
};
export * from './environment';
