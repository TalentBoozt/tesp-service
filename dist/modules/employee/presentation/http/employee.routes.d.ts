import { Router } from 'express';
import { EmployeeMongoRepository } from '../../infrastructure/persistence/mongoose/employee.repository';
import { OrgNodeMongoRepository } from '../../../organization/infrastructure/persistence/mongoose/org-node.repository';
import { GetEmployeeSurveyHistoryUseCase } from '../../application/use-cases/get-employee-survey-history.use-case';
import { ManageHrisConfigUseCase } from '../../application/use-cases/manage-hris-config.use-case';
export declare function createEmployeeRouter(employeeRepo?: EmployeeMongoRepository, orgNodeRepo?: OrgNodeMongoRepository, surveyHistoryUseCase?: GetEmployeeSurveyHistoryUseCase, hrisConfigUseCase?: ManageHrisConfigUseCase): Router;
