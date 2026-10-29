import { Router } from 'express';
import { RedisAnalyticsRepository } from '../../infrastructure/cache/redis-analytics.repository';
import { IAnalyticalSnapshotRepository } from '../../domain/repositories/analytical-snapshot.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
export declare function createAnalyticsEngineRouter(snapshotRepo?: IAnalyticalSnapshotRepository, responseRepo?: ISurveyResponseRepository, redisAnalyticsRepo?: RedisAnalyticsRepository, surveyRepo?: ISurveyRepository, projectRepo?: IProjectRepository): Router;
