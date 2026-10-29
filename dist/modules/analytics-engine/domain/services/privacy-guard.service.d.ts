export interface ProtectedMetricResult {
    status: 'VALID' | 'SUPPRESSED';
    responseCount: number;
    eNPS: number | null;
    engagementIndex: number | null;
    reason?: string;
}
export declare class PrivacyGuardService {
    static MIN_THRESHOLD: number;
    applyPrivacyGuard(responseCount: number, computedEnps: number | null, computedEngagementIndex: number | null): ProtectedMetricResult;
    canExposeCohort(responseCount: number): boolean;
    getMinCohortSize(): number;
}
