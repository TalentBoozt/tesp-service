import { ReportJobEntity } from '../entities/report-job.entity';
export interface IReportJobRepository {
    save(job: ReportJobEntity): Promise<ReportJobEntity>;
    findByJobId(projectId: string, jobId: string): Promise<ReportJobEntity | null>;
    findAllByProject(projectId: string, requestedBy?: string): Promise<ReportJobEntity[]>;
}
