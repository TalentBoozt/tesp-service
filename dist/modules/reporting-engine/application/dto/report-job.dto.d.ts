import { z } from 'zod';
export declare const RequestReportGenerationDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
    surveyId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    reportType: z.ZodOptional<z.ZodEnum<["EXEC_SUMMARY_PDF", "DEPT_BREAKDOWN_PDF", "RAW_RESPONSES_XLSX", "AGGREGATED_SCORES_XLSX", "BOARDROOM_DECK_POWERPOINT", "AGENTIC_PROMPT_PACK", "SCOPED_REPORT"]>>;
    format: z.ZodOptional<z.ZodEnum<["PDF", "EXCEL", "POWERPOINT", "PROMPT", "WEB"]>>;
    scopeType: z.ZodOptional<z.ZodEnum<["ORGANIZATION", "DEPARTMENT", "DEMOGRAPHIC_SEGMENT", "BUSINESS_UNIT"]>>;
    scopeFilter: z.ZodOptional<z.ZodObject<{
        nodeId: z.ZodOptional<z.ZodString>;
        nodeName: z.ZodOptional<z.ZodString>;
        demographicKey: z.ZodOptional<z.ZodString>;
        demographicValue: z.ZodOptional<z.ZodString>;
        matrixTeamId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nodeId?: string | undefined;
        nodeName?: string | undefined;
        demographicKey?: string | undefined;
        demographicValue?: string | undefined;
        matrixTeamId?: string | undefined;
    }, {
        nodeId?: string | undefined;
        nodeName?: string | undefined;
        demographicKey?: string | undefined;
        demographicValue?: string | undefined;
        matrixTeamId?: string | undefined;
    }>>;
    nodeId: z.ZodOptional<z.ZodString>;
    includeAiSentimentSummary: z.ZodOptional<z.ZodBoolean>;
    includeBenchmarkComparison: z.ZodOptional<z.ZodBoolean>;
    passwordProtected: z.ZodOptional<z.ZodBoolean>;
    pdfPassword: z.ZodOptional<z.ZodString>;
    bypassPrivacy: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    campaignId: string;
    nodeId?: string | undefined;
    surveyId?: string | undefined;
    title?: string | undefined;
    format?: "PDF" | "EXCEL" | "POWERPOINT" | "PROMPT" | "WEB" | undefined;
    bypassPrivacy?: boolean | undefined;
    reportType?: "EXEC_SUMMARY_PDF" | "DEPT_BREAKDOWN_PDF" | "RAW_RESPONSES_XLSX" | "AGGREGATED_SCORES_XLSX" | "BOARDROOM_DECK_POWERPOINT" | "AGENTIC_PROMPT_PACK" | "SCOPED_REPORT" | undefined;
    scopeType?: "ORGANIZATION" | "DEPARTMENT" | "DEMOGRAPHIC_SEGMENT" | "BUSINESS_UNIT" | undefined;
    scopeFilter?: {
        nodeId?: string | undefined;
        nodeName?: string | undefined;
        demographicKey?: string | undefined;
        demographicValue?: string | undefined;
        matrixTeamId?: string | undefined;
    } | undefined;
    includeAiSentimentSummary?: boolean | undefined;
    includeBenchmarkComparison?: boolean | undefined;
    passwordProtected?: boolean | undefined;
    pdfPassword?: string | undefined;
}, {
    projectId: string;
    campaignId: string;
    nodeId?: string | undefined;
    surveyId?: string | undefined;
    title?: string | undefined;
    format?: "PDF" | "EXCEL" | "POWERPOINT" | "PROMPT" | "WEB" | undefined;
    bypassPrivacy?: boolean | undefined;
    reportType?: "EXEC_SUMMARY_PDF" | "DEPT_BREAKDOWN_PDF" | "RAW_RESPONSES_XLSX" | "AGGREGATED_SCORES_XLSX" | "BOARDROOM_DECK_POWERPOINT" | "AGENTIC_PROMPT_PACK" | "SCOPED_REPORT" | undefined;
    scopeType?: "ORGANIZATION" | "DEPARTMENT" | "DEMOGRAPHIC_SEGMENT" | "BUSINESS_UNIT" | undefined;
    scopeFilter?: {
        nodeId?: string | undefined;
        nodeName?: string | undefined;
        demographicKey?: string | undefined;
        demographicValue?: string | undefined;
        matrixTeamId?: string | undefined;
    } | undefined;
    includeAiSentimentSummary?: boolean | undefined;
    includeBenchmarkComparison?: boolean | undefined;
    passwordProtected?: boolean | undefined;
    pdfPassword?: string | undefined;
}>;
export type RequestReportGenerationDto = z.infer<typeof RequestReportGenerationDtoSchema>;
