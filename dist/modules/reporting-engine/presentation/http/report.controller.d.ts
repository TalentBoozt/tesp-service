import { Request, Response, NextFunction } from 'express';
import { RequestReportGenerationUseCase } from '../../application/use-cases/request-report-generation.use-case';
import { GetReportJobStatusUseCase } from '../../application/use-cases/get-report-job-status.use-case';
import { ListReportJobsUseCase } from '../../application/use-cases/list-report-jobs.use-case';
export declare class ReportController {
    private requestReportGenerationUseCase;
    private getReportJobStatusUseCase;
    private listReportJobsUseCase;
    constructor(requestReportGenerationUseCase: RequestReportGenerationUseCase, getReportJobStatusUseCase: GetReportJobStatusUseCase, listReportJobsUseCase: ListReportJobsUseCase);
    requestReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getJobStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listJobs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    downloadReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
