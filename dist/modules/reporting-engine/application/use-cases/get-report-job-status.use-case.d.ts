import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
import { ReportJobEntity } from '../../domain/entities/report-job.entity';
export declare class GetReportJobStatusUseCase {
    private reportJobRepo;
    constructor(reportJobRepo: IReportJobRepository);
    execute(projectId: string, jobId: string): Promise<ReportJobEntity>;
}
