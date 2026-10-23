"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresignedUrlIssuerService = void 0;
class PresignedUrlIssuerService {
    issuePresignedUrl(projectId, jobId, reportType) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours (86400s)
        const ext = reportType.endsWith('XLSX') ? 'xlsx' : 'pdf';
        const downloadUrl = `https://tesp-report-exports.s3.amazonaws.com/${projectId}/${jobId}.${ext}?expires=${Math.floor(expiresAt.getTime() / 1000)}`;
        return {
            downloadUrl,
            expiresAt,
        };
    }
}
exports.PresignedUrlIssuerService = PresignedUrlIssuerService;
//# sourceMappingURL=presigned-url-issuer.service.js.map