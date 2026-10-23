import { Router } from 'express';
import { RedisAnalyticsRepository } from '../../infrastructure/cache/redis-analytics.repository';
import { IAnalyticalSnapshotRepository } from '../../domain/repositories/analytical-snapshot.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
export declare function createAnalyticsEngineRouter(snapshotRepo?: IAnalyticalSnapshotRepository, responseRepo?: ISurveyResponseRepository, redisAnalyticsRepo?: RedisAnalyticsRepository): Router;
