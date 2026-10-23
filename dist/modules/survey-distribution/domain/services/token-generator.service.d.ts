import { AnonymityLevel } from '../entities/campaign.entity';
export declare class TokenGeneratorService {
    private static readonly SALT_SECRET;
    generateToken(anonymityLevel: AnonymityLevel, campaignId: string, employeeId?: string): string;
    generate6DigitPin(): string;
}
