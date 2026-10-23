"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisAnalyticsRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../../../../shared/infrastructure/cache/redis");
class RedisAnalyticsRepository {
    client;
    constructor(customClient) {
        this.client = customClient || redis_1.RedisService.getClient();
    }
    generateFilterHash(filters) {
        const sorted = JSON.stringify(filters, Object.keys(filters).sort());
        return crypto_1.default.createHash('sha256').update(sorted).digest('hex').substring(0, 16);
    }
    getKey(projectId, campaignId, filterHash) {
        return `tesp:analytics:${projectId}:${campaignId}:${filterHash}`;
    }
    async getCachedAnalytics(projectId, campaignId, filterHash) {
        const key = this.getKey(projectId, campaignId, filterHash);
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
    async cacheAnalytics(projectId, campaignId, filterHash, data, ttlSeconds = 3600) {
        const key = this.getKey(projectId, campaignId, filterHash);
        await this.client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    }
}
exports.RedisAnalyticsRepository = RedisAnalyticsRepository;
//# sourceMappingURL=redis-analytics.repository.js.map