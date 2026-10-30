import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
export interface MySurveyItem {
    campaignId: string;
    title: string;
    surveyId: string;
    surveyVersion: number;
    anonymityLevel: string;
    channel: string;
    token: string;
    pin?: string;
    surveyUrl: string;
    expirationDate: string;
    startDate?: string;
    status?: 'ACTIVE' | 'COMPLETED';
}
export declare class GetMySurveysUseCase {
    private campaignRepo?;
    private vaultRepo?;
    constructor(campaignRepo?: ISurveyCampaignRepository | undefined, vaultRepo?: ITokenVaultRepository | undefined);
    execute(projectId: string, employeeId: string, email?: string): Promise<MySurveyItem[]>;
}
