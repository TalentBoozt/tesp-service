export interface ICacheClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: 'EX', duration?: number): Promise<'OK' | null>;
    del(key: string): Promise<number>;
    flushall(): Promise<'OK'>;
    close(): Promise<void>;
}
export declare class RedisService {
    private static client;
    private static useMemory;
    static getClient(): ICacheClient;
    static useInMemoryFallback(): void;
}
