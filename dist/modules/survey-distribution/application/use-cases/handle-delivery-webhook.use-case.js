"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleDeliveryWebhookUseCase = exports.InMemoryDeliveryEventStore = void 0;
const delivery_event_schema_1 = require("../../infrastructure/persistence/mongoose/delivery-event.schema");
const mongoose_1 = __importDefault(require("mongoose"));
class InMemoryDeliveryEventStore {
    seen = new Set();
    async recordEvent(provider, eventId) {
        const key = `${provider}:${eventId}`;
        if (this.seen.has(key)) {
            return false;
        }
        this.seen.add(key);
        return true;
    }
    clear() {
        this.seen.clear();
    }
}
exports.InMemoryDeliveryEventStore = InMemoryDeliveryEventStore;
class HandleDeliveryWebhookUseCase {
    campaignRepo;
    eventStore;
    inMemoryFallback = new InMemoryDeliveryEventStore();
    constructor(campaignRepo, eventStore) {
        this.campaignRepo = campaignRepo;
        this.eventStore = eventStore;
    }
    async execute(payload) {
        const { projectId, campaignId, eventType, provider } = payload;
        const eventId = payload.eventId || payload.messageId;
        let field = null;
        switch (eventType) {
            case 'DELIVERED':
                field = 'delivered';
                break;
            case 'OPENED':
                field = 'opened';
                break;
            case 'BOUNCED':
            case 'FAILED':
                field = 'bounced';
                break;
        }
        if (!field) {
            return { updated: false, status: 'IGNORED', eventId };
        }
        // Atomic deduplication check (GAP-005)
        if (eventId) {
            const isNew = await this.recordEventId(provider, eventId, payload);
            if (!isNew) {
                return {
                    updated: false,
                    status: 'ALREADY_PROCESSED',
                    eventId,
                };
            }
        }
        const updated = await this.campaignRepo.incrementMetrics(projectId, campaignId, field, 1);
        return {
            updated,
            status: 'PROCESSED',
            eventId,
        };
    }
    async recordEventId(provider, eventId, payload) {
        if (this.eventStore) {
            return await this.eventStore.recordEvent(provider, eventId, payload);
        }
        if (mongoose_1.default.connection?.readyState === 1) {
            try {
                await delivery_event_schema_1.DeliveryEventModel.create({
                    provider,
                    eventId,
                    projectId: payload.projectId,
                    campaignId: payload.campaignId,
                    eventType: payload.eventType,
                    recipient: payload.recipientEmail || payload.recipientPhone,
                    processedAt: new Date(),
                });
                return true;
            }
            catch (err) {
                if (err.code === 11000 ||
                    err.name === 'MongoServerError' ||
                    (err.message && err.message.includes('E11000'))) {
                    return false;
                }
                throw err;
            }
        }
        // In-memory fallback for testing / non-mongo runs
        return await this.inMemoryFallback.recordEvent(provider, eventId);
    }
}
exports.HandleDeliveryWebhookUseCase = HandleDeliveryWebhookUseCase;
//# sourceMappingURL=handle-delivery-webhook.use-case.js.map