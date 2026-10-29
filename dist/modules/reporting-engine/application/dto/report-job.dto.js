"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestReportGenerationDtoSchema = void 0;
const zod_1 = require("zod");
exports.RequestReportGenerationDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z.string().min(1, 'campaignId is required'),
    surveyId: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    reportType: zod_1.z.enum([
        'EXEC_SUMMARY_PDF',
        'DEPT_BREAKDOWN_PDF',
        'RAW_RESPONSES_XLSX',
        'AGGREGATED_SCORES_XLSX',
        'BOARDROOM_DECK_POWERPOINT',
        'SCOPED_REPORT',
    ]).optional(),
    format: zod_1.z.enum(['PDF', 'EXCEL', 'POWERPOINT', 'WEB']).optional(),
    scopeType: zod_1.z.enum(['ORGANIZATION', 'DEPARTMENT', 'DEMOGRAPHIC_SEGMENT', 'BUSINESS_UNIT']).optional(),
    scopeFilter: zod_1.z.object({
        nodeId: zod_1.z.string().optional(),
        nodeName: zod_1.z.string().optional(),
        demographicKey: zod_1.z.string().optional(),
        demographicValue: zod_1.z.string().optional(),
        matrixTeamId: zod_1.z.string().optional(),
    }).optional(),
    nodeId: zod_1.z.string().optional(),
    includeAiSentimentSummary: zod_1.z.boolean().optional(),
    includeBenchmarkComparison: zod_1.z.boolean().optional(),
    passwordProtected: zod_1.z.boolean().optional(),
    pdfPassword: zod_1.z.string().optional(),
    bypassPrivacy: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=report-job.dto.js.map