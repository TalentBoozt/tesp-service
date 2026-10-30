import { IReportJobQueue, ReportJobPayload } from '../../application/queue/report-queue.interface';
import { IReportJobRepository } from '../../domain/repositories/report-job.repository.interface';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
import { IStorageService } from '../../../../shared/infrastructure/storage/storage.service';
import { CsvReportGenerator } from '../generators/csv-report.generator';
import { PdfReportGenerator } from '../generators/pdf-report.generator';
import { ExcelReportGenerator } from '../generators/excel-report.generator';
import { PptReportGenerator } from '../generators/ppt-report.generator';
import { PromptReportGenerator } from '../generators/prompt-report.generator';
export declare class ReportJobWorker {
    private queue;
    private reportJobRepo;
    private eventBus;
    private storageService;
    private static instance;
    private isProcessing;
    csvGenerator: CsvReportGenerator;
    pdfGenerator: PdfReportGenerator;
    excelGenerator: ExcelReportGenerator;
    pptGenerator: PptReportGenerator;
    promptGenerator: PromptReportGenerator;
    constructor(queue: IReportJobQueue, reportJobRepo: IReportJobRepository, eventBus?: IEventBus, storageService?: IStorageService);
    static getInstance(reportJobRepo: IReportJobRepository, eventBus?: IEventBus, queue?: IReportJobQueue, storageService?: IStorageService): ReportJobWorker;
    triggerProcessing(): void;
    processQueue(): Promise<void>;
    processNext(): Promise<boolean>;
    processJob(jobPayload: ReportJobPayload): Promise<void>;
}
