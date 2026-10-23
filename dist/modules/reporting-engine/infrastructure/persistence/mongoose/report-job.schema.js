"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportJobModel = void 0;
const mongoose_1 = require("mongoose");
const ReportJobSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, unique: true, index: true },
    reportType: {
        type: String,
        enum: ['EXEC_SUMMARY_PDF', 'DEPT_BREAKDOWN_PDF', 'RAW_RESPONSES_XLSX', 'AGGREGATED_SCORES_XLSX'],
        required: true,
    },
    nodeId: { type: String },
    requestedBy: { type: String, required: true },
    status: {
        type: String,
        enum: ['QUEUED', 'PENDING', 'PROCESSING', 'COMPLETED', 'READY', 'FAILED'],
        default: 'QUEUED',
        required: true,
    },
    downloadUrl: { type: String },
    expiresAt: { type: Date },
    errorMessage: { type: String },
    fileSizeBytes: { type: Number },
    createdAt: { type: Date, required: true },
    completedAt: { type: Date },
}, {
    timestamps: false,
    collection: 'report_jobs',
});
ReportJobSchema.index({ projectId: 1, jobId: 1 });
ReportJobSchema.index({ status: 1 });
exports.ReportJobModel = (0, mongoose_1.model)('ReportJob', ReportJobSchema);
//# sourceMappingURL=report-job.schema.js.map