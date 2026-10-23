export interface IDomainEvent {
    eventId: string;
    eventType: string;
    aggregateId: string;
    timestamp: Date;
    payload: Record<string, any>;
}
export declare class DomainEventBus {
    private static instance;
    private emitter;
    private constructor();
    static getInstance(): DomainEventBus;
    publish(event: IDomainEvent): void;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void | Promise<void>): void;
    clearAllHandlers(): void;
}
