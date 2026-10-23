import { RedisTokenRepository, CachedTokenPayload } from '../../infrastructure/cache/redis-token.repository';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
export interface TokenValidationResult {
    valid: boolean;
    burned: boolean;
    payload?: CachedTokenPayload;
    error?: string;
}
export declare class ValidateAndBurnTokenUseCase {
    private redisRepo;
    private vaultRepo?;
    private campaignRepo?;
    constructor(redisRepo: RedisTokenRepository, vaultRepo?: ITokenVaultRepository | undefined, campaignRepo?: ISurveyCampaignRepository | undefined);
    private resolveAlternativeTokens;
    validateToken(token: string): Promise<TokenValidationResult>;
    burnToken(token: string): Promise<TokenValidationResult>;
}
