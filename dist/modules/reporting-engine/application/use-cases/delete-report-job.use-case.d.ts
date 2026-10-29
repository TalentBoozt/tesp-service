import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
import { IStorageService } from '../../../../shared/infrastructure/storage/storage.service';
export declare class DeleteReportJobUseCase {
    private reportJobRepo;
    private storageService;
    constructor(reportJobRepo: IReportJobRepository, storageService?: IStorageService);
    execute(jobId: string, projectId?: string, isSuperAdmin?: boolean): Promise<boolean>;
}
