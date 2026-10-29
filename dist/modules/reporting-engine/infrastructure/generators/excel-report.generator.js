"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelReportGenerator = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const exceljs_1 = __importDefault(require("exceljs"));
const scoped_data_aggregator_service_1 = require("../services/scoped-data-aggregator.service");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
const pdf_report_generator_1 = require("./pdf-report.generator");
class ExcelReportGenerator {
    aggregator = new scoped_data_aggregator_service_1.ScopedDataAggregatorService();
    async generateExcel(options) {
        const { reportId, projectId, campaignId, title, scopeType, scopeFilter } = options;
        const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
        await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
        const metrics = await this.aggregator.aggregate(projectId, campaignId, scopeType, scopeFilter, options.bypassPrivacy);
        const fileName = `${reportId}.xlsx`;
        const filePath = path_1.default.join(reportsDir, fileName);
        const organizationName = options.branding?.organizationName || 'Talnova Enterprise Survey Platform';
        const primaryColor = (0, pdf_report_generator_1.sanitizeHexColor)(options.branding?.primaryColor, '#0F172A');
        const headerArgb = 'FF' + primaryColor.replace('#', '').toUpperCase();
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = organizationName;
        workbook.created = new Date();
        // -------------------------------------------------------------
        // Tab 1: Executive Summary
        // -------------------------------------------------------------
        const summarySheet = workbook.addWorksheet('Executive Summary', {
            properties: { tabColor: { argb: 'FF1E293B' } },
            headerFooter: {
                oddHeader: `&C&B${organizationName} - Executive Summary`,
            },
        });
        const categoryHeader = options.branding?.organizationName
            ? `${options.branding.organizationName} - Metric Category`
            : 'Metric Category';
        summarySheet.columns = [
            { header: categoryHeader, key: 'category', width: 34 },
            { header: 'Metric Name', key: 'name', width: 34 },
            { header: 'Score / Value', key: 'value', width: 22 },
            { header: 'Benchmark', key: 'benchmark', width: 16 },
            { header: 'Status / Notes', key: 'notes', width: 36 },
        ];
        // Style Header Row
        const headerRow = summarySheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: headerArgb },
        };
        if (metrics.isSuppressed) {
            summarySheet.addRow({
                category: 'Privacy Protection',
                name: 'Anonymity Threshold Active',
                value: 'SUPPRESSED',
                benchmark: 'N/A',
                notes: metrics.suppressionNotice || 'Sample size N < 5. Metrics suppressed to protect respondent privacy.',
            });
        }
        else {
            summarySheet.addRow({
                category: 'eNPS',
                name: 'Employee Net Promoter Score',
                value: Number(metrics.enpsScore.toFixed(1)),
                benchmark: 25.0,
                notes: `${metrics.promotersPercent}% Promoters, ${metrics.passivesPercent}% Passives, ${metrics.detractorsPercent}% Detractors`,
            });
            const engagementBenchmark = options.includeBenchmarkComparison === false
                ? 'N/A'
                : options.benchmark !== undefined && options.benchmark !== null
                    ? options.benchmark
                    : 75.0;
            summarySheet.addRow({
                category: 'Engagement',
                name: 'Overall Engagement Score',
                value: Number(metrics.overallEngagementScore.toFixed(1)),
                benchmark: engagementBenchmark,
                notes: 'Scale 0 - 100',
            });
            summarySheet.addRow({
                category: 'Participation',
                name: 'Turnout & Response Rate',
                value: `${metrics.participationRate}%`,
                benchmark: '70%',
                notes: `${metrics.sampleSize} of ${metrics.eligibleCount} eligible respondents`,
            });
            summarySheet.addRow({
                category: 'Scope Metadata',
                name: 'Tenant & Target Scope',
                value: `${metrics.projectId}`,
                benchmark: 'N/A',
                notes: `Scope: ${metrics.scopeType}${options.scopeFilter?.nodeName ? ' (' + options.scopeFilter.nodeName + ')' : ''}`,
            });
        }
        // -------------------------------------------------------------
        // Tab 2: Core Driver Scores
        // -------------------------------------------------------------
        const driverSheet = workbook.addWorksheet('Core Driver Scores', {
            properties: { tabColor: { argb: 'FF2563EB' } },
            headerFooter: {
                oddHeader: `&C&B${organizationName} - Core Driver Scores`,
            },
        });
        driverSheet.columns = [
            { header: 'Driver Code', key: 'code', width: 18 },
            { header: 'Engagement Dimension', key: 'name', width: 36 },
            { header: 'Score (0-5)', key: 'score', width: 16 },
            { header: 'Global Benchmark', key: 'benchmark', width: 18 },
            { header: 'Variance vs Benchmark', key: 'variance', width: 22 },
            { header: 'Status', key: 'status', width: 16 },
        ];
        const driverHeaderRow = driverSheet.getRow(1);
        driverHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        driverHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E40AF' },
        };
        if (!metrics.isSuppressed && metrics.driverScores) {
            for (const d of metrics.driverScores) {
                driverSheet.addRow({
                    code: d.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                    name: d.name,
                    score: Number(d.score.toFixed(1)),
                    benchmark: Number(d.benchmark.toFixed(1)),
                    variance: Number(d.variance.toFixed(1)),
                    status: d.variance >= 0 ? 'Favorable' : 'Below Benchmark',
                });
            }
        }
        // -------------------------------------------------------------
        // Tab 3: Demographic Cross-Tabs
        // -------------------------------------------------------------
        const demographicSheet = workbook.addWorksheet('Demographic Cross-Tabs', {
            properties: { tabColor: { argb: 'FF059669' } },
            headerFooter: {
                oddHeader: `&C&B${organizationName} - Demographic Cross-Tabs`,
            },
        });
        demographicSheet.columns = [
            { header: 'Node Code', key: 'nodeCode', width: 18 },
            { header: 'Department / Unit Name', key: 'nodeName', width: 34 },
            { header: 'Sample Size', key: 'sampleSize', width: 14 },
            { header: 'eNPS Score', key: 'enps', width: 14 },
            { header: 'Participation %', key: 'participation', width: 16 },
            { header: 'Privacy Status', key: 'status', width: 16 },
        ];
        const demoHeaderRow = demographicSheet.getRow(1);
        demoHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        demoHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF065F46' },
        };
        if (!metrics.isSuppressed && metrics.demographicBreakdown) {
            for (const db of metrics.demographicBreakdown) {
                demographicSheet.addRow({
                    nodeCode: `${db.segment}:${db.value}`,
                    nodeName: `${db.segment} - ${db.value}`,
                    sampleSize: db.sampleSize,
                    enps: db.isSuppressed ? 'SUPPRESSED' : Number(db.score.toFixed(1)),
                    participation: `${metrics.participationRate}%`,
                    status: db.isSuppressed ? 'SUPPRESSED (N<5)' : 'VALID',
                });
            }
        }
        // Export valid OpenXML XLSX binary buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const nodeBuffer = Buffer.from(buffer);
        await fs_1.default.promises.writeFile(filePath, nodeBuffer);
        // Stream and upload artifact directly to S3 / Cloud Storage (GAP-008 / TASK-04-02)
        const storageService = storage_service_1.StorageService.getInstance();
        const storageKey = `reports/${projectId}/${reportId}.xlsx`;
        await storageService.uploadArtifact(storageKey, nodeBuffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const presignedDownloadUrl = await storageService.getPresignedDownloadUrl(storageKey, 86400);
        return {
            filePath,
            fileName,
            fileSizeBytes: nodeBuffer.length,
            downloadUrl: presignedDownloadUrl,
            metrics,
        };
    }
}
exports.ExcelReportGenerator = ExcelReportGenerator;
//# sourceMappingURL=excel-report.generator.js.map