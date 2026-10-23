import { Router } from 'express';
import { SurveyMongoRepository } from '../../infrastructure/persistence/mongoose/survey.repository';
export declare function createSurveyRouter(surveyRepo?: SurveyMongoRepository): Router;
