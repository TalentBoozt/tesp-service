import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
import { RequestReportGenerationDto } from '../dto/report-job.dto';
import { IReportJobQueue } from '../queue/report-queue.interface';
import { ReportJobWorker } from '../../infrastructure/queue/report-job.worker';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
export interface RequestReportResult {
    jobId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'READY';
    estimatedDurationSeconds: number;
}
export declare class RequestReportGenerationUseCase {
    private reportJobRepo;
    private eventBus;
    private projectRepo?;
    private reportQueue;
    private reportWorker;
    constructor(reportJobRepo: IReportJobRepository, eventBus?: IEventBus, reportQueue?: IReportJobQueue, reportWorker?: ReportJobWorker, projectRepo?: IProjectRepository | undefined);
    get pdfGenerator(): any;
    set pdfGenerator(val: any);
    get excelGenerator(): any;
    set excelGenerator(val: any);
    execute(dto: RequestReportGenerationDto, requestedBy: string): Promise<RequestReportResult>;
}
