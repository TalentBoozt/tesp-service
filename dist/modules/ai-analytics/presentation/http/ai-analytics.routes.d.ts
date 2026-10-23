import { Router } from 'express';
import { IAiInsightRepository } from '../../domain/repositories/ai-insight.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { IAiProviderAdapter } from '../../application/adapters/ai-provider.adapter.interface';
export declare function createAiAnalyticsRouter(aiInsightRepo?: IAiInsightRepository, responseRepo?: ISurveyResponseRepository, aiProvider?: IAiProviderAdapter): Router;
