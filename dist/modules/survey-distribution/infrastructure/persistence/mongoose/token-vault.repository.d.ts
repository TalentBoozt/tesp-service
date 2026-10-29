import { ITokenVaultRepository } from '../../../domain/repositories/token-vault.repository.interface';
import { TokenVaultEntity } from '../../../domain/entities/token-vault.entity';
export declare class TokenVaultMongoRepository implements ITokenVaultRepository {
    private toEntity;
    saveBatch(vaultEntities: TokenVaultEntity[]): Promise<void>;
    findByToken(token: string): Promise<TokenVaultEntity | null>;
    findUnburnedByCampaign(projectId: string, campaignId: string): Promise<TokenVaultEntity[]>;
    findTokensByCampaign(projectId: string, campaignId: string): Promise<TokenVaultEntity[]>;
    findUnburnedByEmployee(projectId: string, employeeId: string): Promise<TokenVaultEntity[]>;
    burnToken(token: string): Promise<boolean>;
    restoreToken(token: string): Promise<boolean>;
}
