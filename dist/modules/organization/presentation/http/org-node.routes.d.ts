import { Router } from 'express';
import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
export declare function createOrgNodeRouter(repo?: IOrgNodeRepository, employeeRepo?: IEmployeeRepository): Router;
