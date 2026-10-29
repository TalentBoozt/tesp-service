"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresignedUrlIssuerService = void 0;
class PresignedUrlIssuerService {
    issuePresignedUrl(projectId, jobId, reportType) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours (86400s)
        const ext = reportType.endsWith('XLSX') ? 'xlsx' : 'pdf';
        const bucket = process.env.R2_BUCKET || 'tesp-report-exports';
        const host = process.env.R2_ACCOUNT_ID
            ? `${bucket}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
            : `${bucket}.r2.cloudflarestorage.com`;
        const downloadUrl = `https://${host}/${projectId}/${jobId}.${ext}?expires=${Math.floor(expiresAt.getTime() / 1000)}`;
        return {
            downloadUrl,
            expiresAt,
        };
    }
}
exports.PresignedUrlIssuerService = PresignedUrlIssuerService;
//# sourceMappingURL=presigned-url-issuer.service.js.map