"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVaultEntity = void 0;
class TokenVaultEntity {
    projectId;
    campaignId;
    token;
    tokenHash;
    channel;
    employeeId;
    nodeId;
    matrixNodeIds;
    isBurned;
    burnedAt;
    expiresAt;
    createdAt;
    constructor(props) {
        this.projectId = props.projectId;
        this.campaignId = props.campaignId;
        this.token = props.token;
        this.tokenHash = props.tokenHash;
        this.channel = props.channel;
        this.employeeId = props.employeeId;
        this.nodeId = props.nodeId;
        this.matrixNodeIds = Array.isArray(props.matrixNodeIds) ? [...props.matrixNodeIds] : [];
        this.isBurned = props.isBurned ?? false;
        this.burnedAt = props.burnedAt;
        this.expiresAt = props.expiresAt;
        this.createdAt = props.createdAt || new Date();
    }
    burn() {
        if (this.isBurned) {
            throw new Error('Token is already burned');
        }
        this.isBurned = true;
        this.burnedAt = new Date();
    }
    toJSON() {
        return {
            projectId: this.projectId,
            campaignId: this.campaignId,
            token: this.token,
            tokenHash: this.tokenHash,
            channel: this.channel,
            employeeId: this.employeeId,
            nodeId: this.nodeId,
            matrixNodeIds: [...this.matrixNodeIds],
            isBurned: this.isBurned,
            burnedAt: this.burnedAt,
            expiresAt: this.expiresAt,
            createdAt: this.createdAt,
        };
    }
}
exports.TokenVaultEntity = TokenVaultEntity;
//# sourceMappingURL=token-vault.entity.js.map