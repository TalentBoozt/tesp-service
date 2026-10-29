import { IReportJobRepository } from '../../../domain/repositories/report-job.repository.interface';
import { ReportJobEntity } from '../../../domain/entities/report-job.entity';
export declare class ReportJobMongoRepository implements IReportJobRepository {
    private toEntity;
    save(job: ReportJobEntity): Promise<ReportJobEntity>;
    findByJobId(projectId: string, jobId: string): Promise<ReportJobEntity | null>;
    findByJobIdOnly(jobId: string): Promise<ReportJobEntity | null>;
    findAllByProject(projectId: string, requestedBy?: string): Promise<ReportJobEntity[]>;
    deleteJob(jobId: string, projectId?: string): Promise<boolean>;
}
