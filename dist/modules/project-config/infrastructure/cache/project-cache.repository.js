"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRedisCache = void 0;
const redis_1 = require("../../../../shared/infrastructure/cache/redis");
class ProjectRedisCache {
    client;
    TTL_SECONDS = 60;
    constructor(client) {
        this.client = client || redis_1.RedisService.getClient();
    }
    getKey(projectId) {
        return `tesp:config:${projectId}`;
    }
    async get(projectId) {
        try {
            const data = await this.client.get(this.getKey(projectId));
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async set(projectId, payload) {
        try {
            await this.client.set(this.getKey(projectId), JSON.stringify(payload), 'EX', this.TTL_SECONDS);
        }
        catch {
            // Non-blocking cache failure handling
        }
    }
    async evict(projectId) {
        try {
            await this.client.del(this.getKey(projectId));
        }
        catch {
            // Non-blocking cache eviction error handling
        }
    }
}
exports.ProjectRedisCache = ProjectRedisCache;
//# sourceMappingURL=project-cache.repository.js.map