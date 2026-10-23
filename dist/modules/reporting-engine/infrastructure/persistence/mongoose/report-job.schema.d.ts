import { Document } from 'mongoose';
import { ReportType, JobStatus } from '../../../domain/entities/report-job.entity';
export interface IReportJobDocument extends Document {
    projectId: string;
    campaignId: string;
    jobId: string;
    reportType: ReportType;
    nodeId?: string;
    requestedBy: string;
    status: JobStatus;
    downloadUrl?: string;
    expiresAt?: Date;
    errorMessage?: string;
    fileSizeBytes?: number;
    createdAt: Date;
    completedAt?: Date;
}
export declare const ReportJobModel: import("mongoose").Model<IReportJobDocument, {}, {}, {}, Document<unknown, {}, IReportJobDocument, {}, {}> & IReportJobDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
