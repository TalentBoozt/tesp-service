"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventBus = exports.UpstashEventBus = exports.RedisEventBus = exports.InMemoryEventBus = void 0;
exports.createEventBus = createEventBus;
const events_1 = require("events");
const crypto_1 = require("crypto");
const ioredis_1 = __importDefault(require("ioredis"));
class InMemoryEventBus {
    emitter = new events_1.EventEmitter();
    publish(event) {
        this.emitter.emit(event.eventType, event);
        this.emitter.emit('*', event);
    }
    subscribe(eventType, handler) {
        this.emitter.on(eventType, handler);
    }
    clearAllHandlers() {
        this.emitter.removeAllListeners();
    }
}
exports.InMemoryEventBus = InMemoryEventBus;
class RedisEventBus {
    pubClient;
    subClient;
    emitter = new events_1.EventEmitter();
    channel = 'tesp:domain_events';
    instanceId;
    constructor(redisUrl, pubClientOverride, subClientOverride) {
        if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
            throw new Error('Invalid Redis connection URL. ioredis requires a TCP connection string (redis:// or rediss://), not an HTTP REST endpoint.');
        }
        this.instanceId = (0, crypto_1.randomUUID)();
        this.pubClient =
            pubClientOverride ||
                new ioredis_1.default(redisUrl, {
                    lazyConnect: false,
                    maxRetriesPerRequest: 1,
                });
        this.subClient =
            subClientOverride ||
                new ioredis_1.default(redisUrl, {
                    lazyConnect: false,
                    maxRetriesPerRequest: 1,
                });
        this.subClient.subscribe(this.channel, (err) => {
            if (err) {
                console.error('[RedisEventBus] Subscription error:', err);
            }
        });
        this.subClient.on('message', (_channel, message) => {
            try {
                const parsed = JSON.parse(message);
                let event;
                let originInstanceId;
                if (parsed && parsed.originInstanceId && parsed.event) {
                    originInstanceId = parsed.originInstanceId;
                    event = parsed.event;
                }
                else {
                    event = parsed;
                }
                // Discard local loopback if message was published by this same instance
                if (originInstanceId && originInstanceId === this.instanceId) {
                    return;
                }
                if (event.timestamp) {
                    event.timestamp = new Date(event.timestamp);
                }
                this.emitter.emit(event.eventType, event);
                this.emitter.emit('*', event);
            }
            catch (parseErr) {
                console.error('[RedisEventBus] Failed to parse cluster event message:', parseErr);
            }
        });
    }
    async publish(event) {
        const envelope = {
            originInstanceId: this.instanceId,
            event,
        };
        await this.pubClient.publish(this.channel, JSON.stringify(envelope));
        // Also emit locally for immediate in-process handling
        this.emitter.emit(event.eventType, event);
        this.emitter.emit('*', event);
    }
    subscribe(eventType, handler) {
        this.emitter.on(eventType, handler);
    }
    clearAllHandlers() {
        this.emitter.removeAllListeners();
    }
    async disconnect() {
        await Promise.all([
            this.pubClient.quit().catch(() => { }),
            this.subClient.quit().catch(() => { }),
        ]);
    }
}
exports.RedisEventBus = RedisEventBus;
class UpstashEventBus {
    emitter = new events_1.EventEmitter();
    cleanUrl;
    cleanToken;
    constructor(url, token) {
        this.cleanUrl = (url || process.env.UPSTASH_REDIS_REST_URL || '').replace(/["']/g, '').trim();
        this.cleanToken = (token || process.env.UPSTASH_REDIS_REST_TOKEN || '').replace(/["']/g, '').trim();
    }
    async publish(event) {
        this.emitter.emit(event.eventType, event);
        this.emitter.emit('*', event);
        if (this.cleanUrl && this.cleanUrl.startsWith('http')) {
            try {
                await fetch(this.cleanUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.cleanToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(['PUBLISH', 'tesp:domain_events', JSON.stringify(event)]),
                    signal: AbortSignal.timeout(2000),
                });
            }
            catch {
                // Non-blocking in case of offline/network issues
            }
        }
    }
    subscribe(eventType, handler) {
        this.emitter.on(eventType, handler);
    }
    clearAllHandlers() {
        this.emitter.removeAllListeners();
    }
    async disconnect() {
        this.emitter.removeAllListeners();
    }
}
exports.UpstashEventBus = UpstashEventBus;
function createEventBus() {
    const isClusterOrProd = process.env.NODE_ENV === 'production' || process.env.NODE_APP_INSTANCE !== undefined;
    if (isClusterOrProd) {
        const rawUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
        const restUrl = process.env.UPSTASH_REDIS_REST_URL;
        // Upstash Redis REST mode (Serverless & cloud architecture - local Redis eliminated)
        if (restUrl && !rawUrl) {
            return new UpstashEventBus(restUrl, process.env.UPSTASH_REDIS_REST_TOKEN);
        }
        const redisUrl = rawUrl;
        if (!redisUrl) {
            throw new Error('FATAL: REDIS_URL must be configured when running in production or cluster mode.');
        }
        if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
            throw new Error('Invalid Redis connection URL. ioredis requires a TCP connection string (redis:// or rediss://), not an HTTP REST endpoint.');
        }
        return new RedisEventBus(redisUrl);
    }
    return new InMemoryEventBus();
}
class DomainEventBus {
    static instance;
    activeBus;
    constructor() {
        this.activeBus = createEventBus();
    }
    static getInstance() {
        if (!DomainEventBus.instance) {
            DomainEventBus.instance = new DomainEventBus();
        }
        return DomainEventBus.instance;
    }
    static resetInstance() {
        DomainEventBus.instance = undefined;
    }
    publish(event) {
        return this.activeBus.publish(event);
    }
    subscribe(eventType, handler) {
        this.activeBus.subscribe(eventType, handler);
    }
    clearAllHandlers() {
        this.activeBus.clearAllHandlers();
    }
}
exports.DomainEventBus = DomainEventBus;
//# sourceMappingURL=event-bus.js.map