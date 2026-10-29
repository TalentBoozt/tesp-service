import { Request, Response, NextFunction } from 'express';
import { RequestReportGenerationUseCase } from '../../application/use-cases/request-report-generation.use-case';
import { GetReportJobStatusUseCase } from '../../application/use-cases/get-report-job-status.use-case';
import { ListReportJobsUseCase } from '../../application/use-cases/list-report-jobs.use-case';
import { DeleteReportJobUseCase } from '../../application/use-cases/delete-report-job.use-case';
import { IStorageService } from '../../../../shared/infrastructure/storage/storage.service';
import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
export declare class ReportController {
    private requestReportGenerationUseCase;
    private getReportJobStatusUseCase;
    private listReportJobsUseCase;
    private deleteReportJobUseCase?;
    private reportJobRepo?;
    private storageService;
    constructor(requestReportGenerationUseCase: RequestReportGenerationUseCase, getReportJobStatusUseCase: GetReportJobStatusUseCase, listReportJobsUseCase: ListReportJobsUseCase, storageService?: IStorageService, deleteReportJobUseCase?: DeleteReportJobUseCase | undefined, reportJobRepo?: IReportJobRepository | undefined);
    requestReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getJobStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listJobs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    downloadReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteJob: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
