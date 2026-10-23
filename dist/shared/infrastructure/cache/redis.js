"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const config_1 = require("../../../config");
class InMemoryCacheClient {
    store = new Map();
    async get(key) {
        const item = this.store.get(key);
        if (!item)
            return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, mode, duration) {
        const expiresAt = mode === 'EX' && duration ? Date.now() + duration * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
        return 'OK';
    }
    async del(key) {
        const existed = this.store.has(key);
        this.store.delete(key);
        return existed ? 1 : 0;
    }
    async flushall() {
        this.store.clear();
        return 'OK';
    }
    async close() {
        this.store.clear();
    }
}
class UpstashRestCacheClient {
    url;
    token;
    fallback = new Map();
    constructor(url, token) {
        this.url = url;
        this.token = token;
    }
    async command(cmd) {
        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cmd),
        });
        const data = (await response.json());
        return data.result;
    }
    async get(key) {
        try {
            const res = await this.command(['GET', key]);
            if (res !== null && res !== undefined) {
                return String(res);
            }
        }
        catch {
            // Graceful fallback to memory on network/DNS error
            const item = this.fallback.get(key);
            if (!item)
                return null;
            if (item.expiresAt && Date.now() > item.expiresAt) {
                this.fallback.delete(key);
                return null;
            }
            return item.value;
        }
        return null;
    }
    async set(key, value, mode, duration) {
        try {
            if (mode === 'EX' && duration) {
                await this.command(['SET', key, value, 'EX', duration]);
            }
            else {
                await this.command(['SET', key, value]);
            }
            const expiresAt = mode === 'EX' && duration ? Date.now() + duration * 1000 : undefined;
            this.fallback.set(key, { value, expiresAt });
            return 'OK';
        }
        catch {
            // Graceful fallback to memory on network/DNS error
            const expiresAt = mode === 'EX' && duration ? Date.now() + duration * 1000 : undefined;
            this.fallback.set(key, { value, expiresAt });
            return 'OK';
        }
    }
    async del(key) {
        try {
            const res = await this.command(['DEL', key]);
            this.fallback.delete(key);
            return typeof res === 'number' ? res : 1;
        }
        catch {
            const existed = this.fallback.has(key);
            this.fallback.delete(key);
            return existed ? 1 : 0;
        }
    }
    async flushall() {
        try {
            await this.command(['FLUSHALL']);
        }
        catch { }
        this.fallback.clear();
        return 'OK';
    }
    async close() {
        this.fallback.clear();
    }
}
class RedisService {
    static client = null;
    static useMemory = false;
    static getClient() {
        if (this.client)
            return this.client;
        if (process.env.NODE_ENV === 'test' || this.useMemory) {
            this.client = new InMemoryCacheClient();
            return this.client;
        }
        // App uses only Upstash Redis REST API
        if (config_1.config.upstashRedisRestUrl && config_1.config.upstashRedisRestToken) {
            this.client = new UpstashRestCacheClient(config_1.config.upstashRedisRestUrl, config_1.config.upstashRedisRestToken);
            return this.client;
        }
        this.client = new InMemoryCacheClient();
        return this.client;
    }
    static useInMemoryFallback() {
        this.useMemory = true;
        this.client = new InMemoryCacheClient();
    }
}
exports.RedisService = RedisService;
//# sourceMappingURL=redis.js.map