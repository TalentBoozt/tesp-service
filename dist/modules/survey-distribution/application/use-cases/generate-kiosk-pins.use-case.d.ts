export declare class GenerateKioskPinsUseCase {
    private tokenVaultModelOrRepo;
    private campaignModelOrRepo;
    private redisRepo;
    constructor(tokenVaultModelOrRepo: any, campaignModelOrRepo: any, redisRepo: any);
    execute(projectId: string, campaignId: string, count: number): Promise<string[]>;
}
