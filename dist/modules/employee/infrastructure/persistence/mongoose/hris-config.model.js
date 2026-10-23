"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrisConfigModel = void 0;
const mongoose_1 = require("mongoose");
const HrisConfigSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, unique: true, index: true },
    provider: {
        type: String,
        enum: ['WORKDAY', 'BAMBOOHR', 'SAP_SUCCESSFACTORS', 'OTHER'],
        default: 'WORKDAY',
        required: true,
    },
    tenantUrl: { type: String, required: true },
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    syncSchedule: {
        type: String,
        enum: ['HOURLY', 'NIGHTLY', 'WEEKLY', 'MANUAL'],
        default: 'NIGHTLY',
        required: true,
    },
    lastSyncAt: { type: Date },
    syncedCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['CONNECTED', 'PAUSED', 'ERROR'],
        default: 'CONNECTED',
    },
}, {
    timestamps: true,
    collection: 'hris_configs',
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            delete ret._id;
            delete ret.__v;
            // Mask clientSecret in responses for security
            if (ret.clientSecret) {
                ret.clientSecret = '••••••••••••••••';
            }
            return ret;
        },
    },
});
exports.HrisConfigModel = (0, mongoose_1.model)('HrisConfig', HrisConfigSchema);
//# sourceMappingURL=hris-config.model.js.map