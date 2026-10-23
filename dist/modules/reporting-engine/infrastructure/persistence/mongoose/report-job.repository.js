"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportJobMongoRepository = void 0;
const report_job_entity_1 = require("../../../domain/entities/report-job.entity");
const report_job_schema_1 = require("./report-job.schema");
class ReportJobMongoRepository {
    toEntity(doc) {
        return new report_job_entity_1.ReportJobEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            jobId: doc.jobId,
            reportType: doc.reportType,
            nodeId: doc.nodeId,
            requestedBy: doc.requestedBy,
            status: doc.status,
            downloadUrl: doc.downloadUrl,
            expiresAt: doc.expiresAt,
            errorMessage: doc.errorMessage,
            fileSizeBytes: doc.fileSizeBytes,
            createdAt: doc.createdAt,
            completedAt: doc.completedAt,
        });
    }
    async save(job) {
        const raw = job.toJSON();
        const doc = await report_job_schema_1.ReportJobModel.findOneAndUpdate({ projectId: raw.projectId, jobId: raw.jobId }, {
            $set: {
                campaignId: raw.campaignId,
                reportType: raw.reportType,
                nodeId: raw.nodeId,
                requestedBy: raw.requestedBy,
                status: raw.status,
                downloadUrl: raw.downloadUrl,
                expiresAt: raw.expiresAt,
                errorMessage: raw.errorMessage,
                fileSizeBytes: raw.fileSizeBytes,
                completedAt: raw.completedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                jobId: raw.jobId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByJobId(projectId, jobId) {
        const doc = await report_job_schema_1.ReportJobModel.findOne({ projectId, jobId });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAllByProject(projectId, requestedBy) {
        const query = { projectId };
        if (requestedBy)
            query.requestedBy = requestedBy;
        const docs = await report_job_schema_1.ReportJobModel.find(query).sort({ createdAt: -1 });
        return docs.map((doc) => this.toEntity(doc));
    }
}
exports.ReportJobMongoRepository = ReportJobMongoRepository;
//# sourceMappingURL=report-job.repository.js.map