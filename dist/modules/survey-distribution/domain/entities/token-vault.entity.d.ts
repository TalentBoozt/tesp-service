export interface TokenVaultProps {
    projectId: string;
    campaignId: string;
    token: string;
    tokenHash?: string;
    channel?: string;
    employeeId?: string;
    nodeId?: string;
    isBurned?: boolean;
    burnedAt?: Date;
    expiresAt?: Date;
    createdAt?: Date;
}
export declare class TokenVaultEntity {
    readonly projectId: string;
    readonly campaignId: string;
    readonly token: string;
    readonly tokenHash?: string;
    readonly channel?: string;
    readonly employeeId?: string;
    readonly nodeId?: string;
    isBurned: boolean;
    burnedAt?: Date;
    readonly expiresAt?: Date;
    readonly createdAt: Date;
    constructor(props: TokenVaultProps);
    burn(): void;
    toJSON(): TokenVaultProps;
}
