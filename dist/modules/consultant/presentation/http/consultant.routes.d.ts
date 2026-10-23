import { Router } from 'express';
import { IConsultantRepository } from '../../domain/repositories/consultant.repository.interface';
export declare function createConsultantRouter(repository?: IConsultantRepository): Router;
