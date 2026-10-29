import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
export interface DispatchRemindersResult {
    campaignId: string;
    totalRemindersSent: number;
    uncompletedCount: number;
    dispatchedCount: number;
}
export declare class DispatchRemindersUseCase {
    private campaignRepo;
    private vaultRepo;
    private notificationDispatcher;
    private employeeRepo?;
    private eventBus;
    constructor(campaignRepo: ISurveyCampaignRepository, vaultRepo: ITokenVaultRepository, employeeRepoOrEventBus?: IEmployeeRepository | IEventBus, eventBus?: IEventBus);
    execute(projectId: string, campaignId: string): Promise<DispatchRemindersResult>;
}
