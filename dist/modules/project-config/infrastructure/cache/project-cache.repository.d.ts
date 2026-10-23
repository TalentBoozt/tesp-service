import { ICacheClient } from '../../../../shared/infrastructure/cache/redis';
export declare class ProjectRedisCache {
    private client;
    private readonly TTL_SECONDS;
    constructor(client?: ICacheClient);
    private getKey;
    get(projectId: string): Promise<Record<string, any> | null>;
    set(projectId: string, payload: Record<string, any>): Promise<void>;
    evict(projectId: string): Promise<void>;
}
