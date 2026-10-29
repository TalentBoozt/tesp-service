"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const config_1 = require("../../../config");
class InMemoryCacheClient {
    store = new Map();
    lists = new Map();
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
        let count = 0;
        if (this.store.delete(key))
            count = 1;
        if (this.lists.delete(key))
            count = 1;
        return count;
    }
    async flushall() {
        this.store.clear();
        this.lists.clear();
        return 'OK';
    }
    async close() {
        this.store.clear();
        this.lists.clear();
    }
    async rpush(key, value) {
        const list = this.lists.get(key) || [];
        list.push(value);
        this.lists.set(key, list);
        return list.length;
    }
    async lpop(key) {
        const list = this.lists.get(key) || [];
        const item = list.shift() || null;
        return item;
    }
    async llen(key) {
        const list = this.lists.get(key) || [];
        return list.length;
    }
}
class UpstashRestCacheClient {
    fallback = new Map();
    listFallback = new Map();
    cleanUrl;
    cleanToken;
    constructor(url, token) {
        this.cleanUrl = (url || '').replace(/["']/g, '').trim();
        this.cleanToken = (token || '').replace(/["']/g, '').trim();
    }
    async command(cmd) {
        if (!this.cleanUrl || !this.cleanUrl.startsWith('http')) {
            throw new Error('Invalid Upstash Redis REST URL');
        }
        const response = await fetch(this.cleanUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.cleanToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cmd),
            signal: AbortSignal.timeout(3000),
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
            this.listFallback.delete(key);
            return typeof res === 'number' ? res : 1;
        }
        catch {
            let count = 0;
            if (this.fallback.delete(key))
                count = 1;
            if (this.listFallback.delete(key))
                count = 1;
            return count;
        }
    }
    async flushall() {
        try {
            await this.command(['FLUSHALL']);
        }
        catch { }
        this.fallback.clear();
        this.listFallback.clear();
        return 'OK';
    }
    async close() {
        this.fallback.clear();
        this.listFallback.clear();
    }
    async rpush(key, value) {
        try {
            const res = await this.command(['RPUSH', key, value]);
            return typeof res === 'number' ? res : 1;
        }
        catch {
            const list = this.listFallback.get(key) || [];
            list.push(value);
            this.listFallback.set(key, list);
            return list.length;
        }
    }
    async lpop(key) {
        try {
            const res = await this.command(['LPOP', key]);
            return res !== null && res !== undefined ? String(res) : null;
        }
        catch {
            const list = this.listFallback.get(key) || [];
            return list.shift() || null;
        }
    }
    async llen(key) {
        try {
            const res = await this.command(['LLEN', key]);
            return typeof res === 'number' ? res : 0;
        }
        catch {
            const list = this.listFallback.get(key) || [];
            return list.length;
        }
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
        // App uses exclusively Upstash Redis REST API
        const restUrl = config_1.config.upstashRedisRestUrl || process.env.UPSTASH_REDIS_REST_URL;
        const restToken = config_1.config.upstashRedisRestToken || process.env.UPSTASH_REDIS_REST_TOKEN;
        if (restUrl && restToken) {
            this.client = new UpstashRestCacheClient(restUrl, restToken);
            return this.client;
        }
        this.client = new InMemoryCacheClient();
        return this.client;
    }
    static useInMemoryFallback() {
        this.useMemory = true;
        this.client = new InMemoryCacheClient();
    }
    static resetClient() {
        this.client = null;
        this.useMemory = false;
    }
}
exports.RedisService = RedisService;
//# sourceMappingURL=redis.js.map