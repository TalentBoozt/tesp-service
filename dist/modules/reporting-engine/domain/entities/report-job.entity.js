"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportJobEntity = void 0;
class ReportJobEntity {
    projectId;
    campaignId;
    jobId;
    reportType;
    nodeId;
    requestedBy;
    status;
    downloadUrl;
    expiresAt;
    errorMessage;
    fileSizeBytes;
    createdAt;
    completedAt;
    constructor(props) {
        if (!props.projectId || !props.campaignId || !props.requestedBy) {
            throw new Error('projectId, campaignId, and requestedBy are required');
        }
        this.validateJobId(props.jobId);
        this.projectId = props.projectId;
        this.campaignId = props.campaignId;
        this.jobId = props.jobId;
        this.reportType = props.reportType;
        this.nodeId = props.nodeId;
        this.requestedBy = props.requestedBy;
        this.status = props.status || 'QUEUED';
        this.downloadUrl = props.downloadUrl;
        this.expiresAt = props.expiresAt;
        this.errorMessage = props.errorMessage;
        this.fileSizeBytes = props.fileSizeBytes;
        this.createdAt = props.createdAt || new Date();
        this.completedAt = props.completedAt;
    }
    validateJobId(jobId) {
        const pattern = /^JOB-[A-Za-z0-9_-]{3,50}$/;
        if (!pattern.test(jobId)) {
            throw new Error(`Invalid Job ID format: '${jobId}'. Must match pattern ^JOB-[A-Za-z0-9_-]{3,50}$`);
        }
    }
    completeJob(downloadUrl, expiresAt, fileSizeBytes) {
        this.status = 'COMPLETED';
        this.downloadUrl = downloadUrl;
        this.expiresAt = expiresAt;
        this.fileSizeBytes = fileSizeBytes;
        this.completedAt = new Date();
    }
    get failureReason() {
        return this.errorMessage;
    }
    set failureReason(val) {
        this.errorMessage = val;
    }
    failJob(errorMessage) {
        this.status = 'FAILED';
        this.errorMessage = errorMessage;
        this.completedAt = new Date();
    }
    toJSON() {
        return {
            projectId: this.projectId,
            campaignId: this.campaignId,
            jobId: this.jobId,
            reportType: this.reportType,
            nodeId: this.nodeId,
            requestedBy: this.requestedBy,
            status: this.status,
            downloadUrl: this.downloadUrl,
            expiresAt: this.expiresAt,
            errorMessage: this.errorMessage,
            failureReason: this.errorMessage,
            fileSizeBytes: this.fileSizeBytes,
            createdAt: this.createdAt,
            completedAt: this.completedAt,
        };
    }
}
exports.ReportJobEntity = ReportJobEntity;
//# sourceMappingURL=report-job.entity.js.map