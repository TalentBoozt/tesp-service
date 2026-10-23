import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
import { RequestReportGenerationDto } from '../dto/report-job.dto';
export interface RequestReportResult {
    jobId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'READY';
    estimatedDurationSeconds: number;
}
export declare class RequestReportGenerationUseCase {
    private reportJobRepo;
    private csvGenerator;
    private pdfGenerator;
    private excelGenerator;
    private pptGenerator;
    constructor(reportJobRepo: IReportJobRepository);
    execute(dto: RequestReportGenerationDto, requestedBy: string): Promise<RequestReportResult>;
}
