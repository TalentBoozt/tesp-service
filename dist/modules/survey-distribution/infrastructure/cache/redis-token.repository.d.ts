import { ICacheClient } from '../../../../shared/infrastructure/cache/redis';
export interface CachedTokenPayload {
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    anonymityLevel: string;
    nodeId?: string;
    matrixNodeIds?: string[];
    employeeId?: string;
    expirationDate: string;
}
export declare class RedisTokenRepository {
    private client;
    constructor(customClient?: ICacheClient);
    private getKey;
    cacheToken(token: string, payload: CachedTokenPayload, ttlSeconds: number): Promise<void>;
    cacheBatchTokens(tokens: {
        token: string;
        payload: CachedTokenPayload;
    }[], ttlSeconds: number): Promise<void>;
    getTokenPayload(token: string): Promise<CachedTokenPayload | null>;
    burnToken(token: string): Promise<boolean>;
}
