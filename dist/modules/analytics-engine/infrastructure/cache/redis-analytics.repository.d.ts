import { ICacheClient } from '../../../../shared/infrastructure/cache/redis';
export declare class RedisAnalyticsRepository {
    private client;
    constructor(customClient?: ICacheClient);
    generateFilterHash(filters: Record<string, any>): string;
    private getKey;
    getCachedAnalytics<T>(projectId: string, campaignId: string, filterHash: string): Promise<T | null>;
    cacheAnalytics(projectId: string, campaignId: string, filterHash: string, data: any, ttlSeconds?: number): Promise<void>;
}
