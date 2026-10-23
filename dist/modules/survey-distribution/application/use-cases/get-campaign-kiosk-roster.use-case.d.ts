import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
export interface KioskRosterItem {
    employeeId: string;
    fullName: string;
    nodeId: string;
    pin: string;
    kioskUrl: string;
    channel: string;
    isBurned: boolean;
    burnedAt?: string;
    expiresAt?: string;
}
export interface CampaignKioskRosterResult {
    campaignId: string;
    campaignTitle: string;
    surveyId: string;
    totalGroundWorkers: number;
    burnedCount: number;
    pendingCount: number;
    roster: KioskRosterItem[];
    csvContent?: string;
}
export declare class GetCampaignKioskRosterUseCase {
    private campaignRepo?;
    private vaultRepo?;
    private employeeRepo?;
    constructor(campaignRepo?: ISurveyCampaignRepository | undefined, vaultRepo?: ITokenVaultRepository | undefined, employeeRepo?: IEmployeeRepository | undefined);
    execute(projectId: string, campaignId: string, nodeId?: string): Promise<CampaignKioskRosterResult>;
}
