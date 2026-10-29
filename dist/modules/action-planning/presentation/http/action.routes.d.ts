import { Router } from 'express';
import { IActionPlanRepository } from '../../domain/repositories/action-plan.repository.interface';
import { IActionTemplateRepository } from '../../domain/repositories/action-template.repository.interface';
export declare function createActionPlanningRouter(actionPlanRepo?: IActionPlanRepository, templateRepo?: IActionTemplateRepository, projectRepo?: any, responseRepo?: any): Router;
