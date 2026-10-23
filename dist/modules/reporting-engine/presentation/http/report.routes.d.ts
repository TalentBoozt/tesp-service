import { Router } from 'express';
import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
export declare function createReportingEngineRouter(reportJobRepo?: IReportJobRepository): Router;
