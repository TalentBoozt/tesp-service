import { HydratedBranding } from './brand-hydrator.service';
export interface PdfReportData {
    campaignId: string;
    nodeId: string;
    overallEnps: number | null;
    overallEngagementIndex: number | null;
    responseCount: number;
    status: 'VALID' | 'SUPPRESSED';
    strengths?: string[];
    concerns?: string[];
    recommendations?: string[];
}
export declare class PdfGeneratorService {
    generateExecutivePdf(branding: HydratedBranding, data: PdfReportData): Promise<Buffer>;
}
