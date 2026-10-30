"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVaultMongoRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const token_vault_entity_1 = require("../../../domain/entities/token-vault.entity");
const token_vault_schema_1 = require("./token-vault.schema");
class TokenVaultMongoRepository {
    toEntity(doc) {
        return new token_vault_entity_1.TokenVaultEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            token: doc.token,
            tokenHash: doc.tokenHash,
            channel: doc.channel,
            employeeId: doc.employeeId,
            nodeId: doc.nodeId,
            matrixNodeIds: doc.matrixNodeIds || [],
            isBurned: doc.isBurned,
            burnedAt: doc.burnedAt,
            expiresAt: doc.expiresAt,
            createdAt: doc.createdAt,
        });
    }
    async saveBatch(vaultEntities) {
        if (vaultEntities.length === 0)
            return;
        const docs = vaultEntities.map((e) => {
            const raw = e.toJSON();
            return {
                projectId: raw.projectId,
                campaignId: raw.campaignId,
                token: raw.token,
                tokenHash: raw.tokenHash,
                channel: raw.channel,
                employeeId: raw.employeeId,
                nodeId: raw.nodeId,
                matrixNodeIds: raw.matrixNodeIds,
                isBurned: raw.isBurned,
                burnedAt: raw.burnedAt,
                expiresAt: raw.expiresAt,
                createdAt: raw.createdAt,
            };
        });
        await token_vault_schema_1.TokenVaultModel.insertMany(docs, { ordered: false });
    }
    async findByToken(token) {
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const doc = await token_vault_schema_1.TokenVaultModel.findOne({
            $or: [{ tokenHash: hash }, { token }, { tokenHash: token }],
        });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findUnburnedByCampaign(projectId, campaignId) {
        const docs = await token_vault_schema_1.TokenVaultModel.find({
            projectId,
            campaignId,
            isBurned: false,
        });
        return docs.map((doc) => this.toEntity(doc));
    }
    async findTokensByCampaign(projectId, campaignId) {
        const docs = await token_vault_schema_1.TokenVaultModel.find({ projectId, campaignId });
        return docs.map((doc) => this.toEntity(doc));
    }
    async findUnburnedByEmployee(projectId, employeeId) {
        const docs = await token_vault_schema_1.TokenVaultModel.find({ projectId, employeeId, isBurned: false });
        return docs.map((doc) => this.toEntity(doc));
    }
    async burnToken(token) {
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const res = await token_vault_schema_1.TokenVaultModel.updateOne({ $or: [{ tokenHash: hash }, { token }, { tokenHash: token }], isBurned: false }, { $set: { isBurned: true, burnedAt: new Date() } });
        return res.modifiedCount > 0;
    }
    async restoreToken(token) {
        const hash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const res = await token_vault_schema_1.TokenVaultModel.updateOne({ $or: [{ tokenHash: hash }, { token }, { tokenHash: token }], isBurned: true }, { $set: { isBurned: false }, $unset: { burnedAt: 1 } });
        return res.modifiedCount > 0;
    }
}
exports.TokenVaultMongoRepository = TokenVaultMongoRepository;
//# sourceMappingURL=token-vault.repository.js.map