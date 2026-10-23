"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisTokenRepository = void 0;
const redis_1 = require("../../../../shared/infrastructure/cache/redis");
class RedisTokenRepository {
    client;
    constructor(customClient) {
        this.client = customClient || redis_1.RedisService.getClient();
    }
    getKey(token) {
        return `tesp:tokens:${token}`;
    }
    async cacheToken(token, payload, ttlSeconds) {
        const key = this.getKey(token);
        const value = JSON.stringify(payload);
        await this.client.set(key, value, 'EX', Math.max(1, ttlSeconds));
    }
    async cacheBatchTokens(tokens, ttlSeconds) {
        const validTtl = Math.max(1, ttlSeconds);
        for (const item of tokens) {
            await this.cacheToken(item.token, item.payload, validTtl);
        }
    }
    async getTokenPayload(token) {
        const key = this.getKey(token);
        const data = await this.client.get(key);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async burnToken(token) {
        const key = this.getKey(token);
        const count = await this.client.del(key);
        return count > 0;
    }
}
exports.RedisTokenRepository = RedisTokenRepository;
//# sourceMappingURL=redis-token.repository.js.map