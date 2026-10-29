import { Router } from 'express';
import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiProviderAdapter } from '../../application/adapters/ai-provider.adapter.interface';
import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
export declare function createAiAnalyticsRouter(aiInsightRepo?: IAiInsightRepository, responseRepo?: ISurveyResponseRepository, aiProvider?: IAiProviderAdapter, projectConfigRepo?: IProjectRepository): Router;
