export declare class PresignedUrlIssuerService {
    issuePresignedUrl(projectId: string, jobId: string, reportType: string): {
        downloadUrl: string;
        expiresAt: Date;
    };
}
