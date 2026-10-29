import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface ScopedMetricSummary {
    projectId: string;
    campaignId: string;
    scopeType: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    sampleSize: number;
    totalResponses?: number;
    eligibleCount: number;
    participationRate: number;
    enpsScore: number;
    promotersPercent: number;
    passivesPercent: number;
    detractorsPercent: number;
    overallEngagementScore: number;
    driverScores: {
        name: string;
        score: number;
        benchmark: number;
        variance: number;
    }[];
    departmentBreakdown: {
        department: string;
        sampleSize: number;
        enpsScore: number;
        engagementScore: number;
        isSuppressed: boolean;
    }[];
    demographicBreakdown: {
        segment: string;
        value: string;
        sampleSize: number;
        score: number;
        isSuppressed: boolean;
    }[];
    aiSentiment: {
        positivePercent: number;
        neutralPercent: number;
        negativePercent: number;
        topThemes: {
            theme: string;
            sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
            count: number;
        }[];
        verbatimHighlights: string[];
    };
    isSuppressed: boolean;
    suppressionNotice?: string;
}
export declare class ScopedDataAggregatorService {
    private responseModel;
    private campaignModel;
    private orgNodeModel;
    static readonly PRIVACY_THRESHOLD = 5;
    constructor(responseModel?: any, campaignModel?: any, orgNodeModel?: any);
    aggregate(projectId: string, campaignId: string, scopeType: ReportScopeType, scopeFilter?: IReportScopeFilter, bypassPrivacy?: boolean): Promise<ScopedMetricSummary>;
}
