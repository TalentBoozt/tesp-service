import Redis from 'ioredis';
export interface IDomainEvent {
    eventId: string;
    eventType: string;
    aggregateId: string;
    timestamp: Date;
    payload: Record<string, any>;
}
export interface IEventBus {
    publish(event: IDomainEvent): Promise<void> | void;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void | Promise<void>): void;
    clearAllHandlers(): void;
    disconnect?(): Promise<void>;
}
export declare class InMemoryEventBus implements IEventBus {
    private emitter;
    publish(event: IDomainEvent): void;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void | Promise<void>): void;
    clearAllHandlers(): void;
}
export declare class RedisEventBus implements IEventBus {
    private pubClient;
    private subClient;
    private emitter;
    private readonly channel;
    readonly instanceId: string;
    constructor(redisUrl: string, pubClientOverride?: Redis, subClientOverride?: Redis);
    publish(event: IDomainEvent): Promise<void>;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void | Promise<void>): void;
    clearAllHandlers(): void;
    disconnect(): Promise<void>;
}
export declare class UpstashEventBus implements IEventBus {
    private emitter;
    private cleanUrl;
    private cleanToken;
    constructor(url?: string, token?: string);
    publish(event: IDomainEvent): Promise<void>;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void | Promise<void>): void;
    clearAllHandlers(): void;
    disconnect(): Promise<void>;
}
export declare function createEventBus(): IEventBus;
export declare class DomainEventBus implements IEventBus {
    private static instance;
    private activeBus;
    private constructor();
    static getInstance(): DomainEventBus;
    static resetInstance(): void;
    publish(event: IDomainEvent): Promise<void> | void;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void | Promise<void>): void;
    clearAllHandlers(): void;
}
