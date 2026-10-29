"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentReportJobQueue = void 0;
const redis_1 = require("../../../../shared/infrastructure/cache/redis");
class PersistentReportJobQueue {
    static instance;
    client;
    fallbackQueue = [];
    queueKey = 'tesp:queue:reports';
    constructor(customClient) {
        if (customClient && typeof customClient.rpush === 'function') {
            this.client = customClient;
        }
        else {
            this.client = redis_1.RedisService.getClient();
        }
    }
    static getInstance(customClient) {
        if (!PersistentReportJobQueue.instance) {
            PersistentReportJobQueue.instance = new PersistentReportJobQueue(customClient);
        }
        return PersistentReportJobQueue.instance;
    }
    async enqueue(job) {
        const payload = {
            ...job,
            enqueuedAt: job.enqueuedAt || new Date(),
            attempts: job.attempts || 0,
            maxAttempts: job.maxAttempts || 3,
        };
        try {
            await this.client.rpush(this.queueKey, JSON.stringify(payload));
        }
        catch (err) {
            console.warn('[ReportJobQueue] Upstash Redis enqueue error, falling back to local queue:', err);
            this.fallbackQueue.push(payload);
        }
    }
    async dequeue() {
        try {
            const item = await this.client.lpop(this.queueKey);
            if (item) {
                return JSON.parse(item);
            }
        }
        catch (err) {
            console.warn('[ReportJobQueue] Upstash Redis dequeue error, checking fallback queue:', err);
        }
        return this.fallbackQueue.shift() || null;
    }
    async getQueueLength() {
        let len = 0;
        try {
            len = await this.client.llen(this.queueKey);
        }
        catch { }
        return len + this.fallbackQueue.length;
    }
    async clear() {
        try {
            await this.client.del(this.queueKey);
        }
        catch { }
        this.fallbackQueue = [];
    }
}
exports.PersistentReportJobQueue = PersistentReportJobQueue;
//# sourceMappingURL=report-job.queue.js.map