import { TokenVaultEntity } from '../entities/token-vault.entity';
export interface ITokenVaultRepository {
    saveBatch(vaultEntities: TokenVaultEntity[]): Promise<void>;
    findByToken(token: string): Promise<TokenVaultEntity | null>;
    findUnburnedByCampaign(projectId: string, campaignId: string): Promise<TokenVaultEntity[]>;
    findTokensByCampaign?(projectId: string, campaignId: string): Promise<TokenVaultEntity[]>;
    findUnburnedByEmployee?(projectId: string, employeeId: string): Promise<TokenVaultEntity[]>;
    burnToken(token: string): Promise<boolean>;
}
