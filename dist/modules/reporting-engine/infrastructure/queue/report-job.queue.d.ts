import { IReportJobQueue, ReportJobPayload } from '../../application/queue/report-queue.interface';
import { ICacheClient } from '../../../../shared/infrastructure/cache/redis';
export declare class PersistentReportJobQueue implements IReportJobQueue {
    private static instance;
    private client;
    private fallbackQueue;
    private queueKey;
    constructor(customClient?: ICacheClient | any);
    static getInstance(customClient?: ICacheClient | any): PersistentReportJobQueue;
    enqueue(job: ReportJobPayload): Promise<void>;
    dequeue(): Promise<ReportJobPayload | null>;
    getQueueLength(): Promise<number>;
    clear(): Promise<void>;
}
