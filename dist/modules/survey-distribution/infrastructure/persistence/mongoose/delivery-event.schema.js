"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryEventModel = void 0;
const mongoose_1 = require("mongoose");
const DeliveryEventSchema = new mongoose_1.Schema({
    provider: { type: String, required: true, enum: ['AWS_SES', 'TWILIO'] },
    eventId: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    recipient: { type: String },
    processedAt: { type: Date, default: Date.now, expires: 259200 }, // 72-hour TTL
}, {
    timestamps: true,
    collection: 'delivery_events',
});
// Compound unique index enforcing cryptographic idempotency across providers (GAP-005)
DeliveryEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
exports.DeliveryEventModel = (0, mongoose_1.model)('DeliveryEvent', DeliveryEventSchema);
//# sourceMappingURL=delivery-event.schema.js.map