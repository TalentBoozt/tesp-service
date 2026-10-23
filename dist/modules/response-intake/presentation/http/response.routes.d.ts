import { Router } from 'express';
import { ValidateAndBurnTokenUseCase } from '../../../survey-distribution/application/use-cases/validate-and-burn-token.use-case';
import { ISurveyResponseRepository } from '../../domain/repositories/survey-response.repository.interface';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
export declare function createResponseIntakeRouter(responseRepo?: ISurveyResponseRepository, tokenBurnUseCase?: ValidateAndBurnTokenUseCase, surveyRepo?: ISurveyRepository): Router;
