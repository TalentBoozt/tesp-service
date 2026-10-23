"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVaultModel = void 0;
const mongoose_1 = require("mongoose");
const TokenVaultSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    tokenHash: { type: String, index: true },
    channel: { type: String, index: true },
    employeeId: { type: String, index: true },
    nodeId: { type: String },
    isBurned: { type: Boolean, default: false, index: true },
    burnedAt: { type: Date },
    expiresAt: { type: Date },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'identity_token_vault',
});
TokenVaultSchema.index({ projectId: 1, campaignId: 1, isBurned: 1 });
exports.TokenVaultModel = (0, mongoose_1.model)('IdentityTokenVault', TokenVaultSchema);
//# sourceMappingURL=token-vault.schema.js.map