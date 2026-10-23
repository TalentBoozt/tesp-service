"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventBus = void 0;
const events_1 = require("events");
class DomainEventBus {
    static instance;
    emitter;
    constructor() {
        this.emitter = new events_1.EventEmitter();
    }
    static getInstance() {
        if (!DomainEventBus.instance) {
            DomainEventBus.instance = new DomainEventBus();
        }
        return DomainEventBus.instance;
    }
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
exports.DomainEventBus = DomainEventBus;
//# sourceMappingURL=event-bus.js.map