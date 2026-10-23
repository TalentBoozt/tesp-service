import { Router } from 'express';
import { RedisTokenRepository } from '../../infrastructure/cache/redis-token.repository';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
import { ISurveyCampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { ITokenVaultRepository } from '../../domain/repositories/token-vault.repository.interface';
export declare function createCampaignRouter(campaignRepo?: ISurveyCampaignRepository, vaultRepo?: ITokenVaultRepository, redisRepo?: RedisTokenRepository, surveyRepo?: ISurveyRepository, employeeRepo?: IEmployeeRepository): Router;
