import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
import { RedisTokenRepository } from '../../infrastructure/cache/redis-token.repository';
import { CampaignEntity, AnonymityLevel, DistributionChannel } from '../../domain/entities/campaign.entity';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
import { IOrgNodeRepository } from '../../../organization/domain/repositories/org-node.repository.interface';
export declare class EmptyTargetAudienceError extends Error {
    constructor(message?: string);
}
export interface LaunchCampaignCommand {
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    title: string;
    anonymityLevel: AnonymityLevel;
    channels: DistributionChannel[];
    targetAudience?: {
        nodeIds?: string[];
        demographicFilters?: Record<string, any>;
    };
    schedule?: {
        reminderDates?: (Date | string)[];
        reminderFrequencyDays?: number;
    };
    startDate: Date;
    expirationDate: Date;
    targetEmployeesCount?: number;
}
import { IEventBus } from '../../../../shared/domain/events/event-bus';
export declare class LaunchCampaignUseCase {
    private campaignRepo;
    private vaultRepo;
    private redisRepo;
    private surveyRepo?;
    private employeeRepo?;
    private eventBus;
    private orgNodeRepo?;
    private tokenGenerator;
    private notificationDispatcher;
    constructor(campaignRepo: ISurveyCampaignRepository, vaultRepo: ITokenVaultRepository, redisRepo: RedisTokenRepository, surveyRepo?: ISurveyRepository | undefined, employeeRepo?: IEmployeeRepository | undefined, eventBus?: IEventBus, orgNodeRepo?: IOrgNodeRepository | undefined);
    execute(command: LaunchCampaignCommand): Promise<CampaignEntity>;
}
