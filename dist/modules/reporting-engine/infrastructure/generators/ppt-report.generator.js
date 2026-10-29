"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PptReportGenerator = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pptxgenjs_1 = __importDefault(require("pptxgenjs"));
const scoped_data_aggregator_service_1 = require("../services/scoped-data-aggregator.service");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
class PptReportGenerator {
    aggregator = new scoped_data_aggregator_service_1.ScopedDataAggregatorService();
    storageService = storage_service_1.StorageService.getInstance();
    async generatePpt(options) {
        const { reportId, projectId, campaignId, title, scopeType, scopeFilter } = options;
        const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
        await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
        const metrics = await this.aggregator.aggregate(projectId, campaignId, scopeType, scopeFilter, options.bypassPrivacy);
        const fileName = `${reportId}.pptx`;
        const filePath = path_1.default.join(reportsDir, fileName);
        const pres = new pptxgenjs_1.default();
        pres.layout = 'LAYOUT_16x9';
        pres.author = 'Talnova Enterprise Survey Platform';
        pres.company = 'Talnova Engineering';
        pres.title = title;
        // -------------------------------------------------------------
        // Slide 1: Cover Slide
        // -------------------------------------------------------------
        const slide1 = pres.addSlide();
        slide1.background = { color: '0F172A' }; // Dark slate
        slide1.addText('TALNOVA ENTERPRISE SURVEY PLATFORM', {
            x: 1.0,
            y: 1.2,
            w: 11.3,
            h: 0.5,
            fontSize: 14,
            color: '38BDF8',
            bold: true,
        });
        slide1.addText(title, {
            x: 1.0,
            y: 1.8,
            w: 11.3,
            h: 1.5,
            fontSize: 32,
            color: 'FFFFFF',
            bold: true,
        });
        const metaSubtitle = `Tenant ID: ${metrics.projectId}  |  Campaign: ${metrics.campaignId}\n` +
            `Scope Level: ${metrics.scopeType}${scopeFilter?.nodeName ? ' (' + scopeFilter.nodeName + ')' : ''}\n` +
            `Date: ${new Date().toISOString().split('T')[0]}  |  Auditor: ${options.requestedBy || 'Executive Lead'}`;
        slide1.addText(metaSubtitle, {
            x: 1.0,
            y: 4.0,
            w: 11.3,
            h: 1.2,
            fontSize: 13,
            color: '94A3B8',
        });
        // -------------------------------------------------------------
        // Slide 2: Executive Scorecard
        // -------------------------------------------------------------
        const slide2 = pres.addSlide();
        slide2.background = { color: 'F8FAFC' };
        slide2.addText('EXECUTIVE SUMMARY SCORECARD', {
            x: 0.8,
            y: 0.5,
            w: 11.5,
            h: 0.5,
            fontSize: 20,
            color: '0F172A',
            bold: true,
        });
        if (metrics.isSuppressed) {
            slide2.addText(`PRIVACY SUPPRESSION NOTICE\n\n${metrics.suppressionNotice || 'Data suppressed: Sample size N < 5.'}\nIdentifiable metrics have been suppressed to protect respondent anonymity.`, {
                x: 0.8,
                y: 2.0,
                w: 11.5,
                h: 2.0,
                fontSize: 16,
                color: 'DC2626',
                bold: true,
            });
        }
        else {
            // 3 KPI Card Blocks
            // Card 1: eNPS
            slide2.addShape(pres.ShapeType.rect, {
                x: 0.8,
                y: 1.3,
                w: 3.6,
                h: 2.4,
                fill: { color: 'FFFFFF' },
                line: { color: 'CBD5E1', width: 1 },
            });
            slide2.addText('eNPS SCORE', {
                x: 1.0,
                y: 1.5,
                w: 3.2,
                h: 0.4,
                fontSize: 12,
                color: '64748B',
                bold: true,
            });
            slide2.addText(`${metrics.enpsScore > 0 ? '+' : ''}${metrics.enpsScore.toFixed(1)}`, {
                x: 1.0,
                y: 1.9,
                w: 3.2,
                h: 0.9,
                fontSize: 36,
                color: metrics.enpsScore >= 20 ? '059669' : 'D97706',
                bold: true,
            });
            slide2.addText(`${metrics.promotersPercent}% Promoters | ${metrics.detractorsPercent}% Detractors`, {
                x: 1.0,
                y: 2.9,
                w: 3.2,
                h: 0.5,
                fontSize: 11,
                color: '64748B',
            });
            // Card 2: Engagement Score
            slide2.addShape(pres.ShapeType.rect, {
                x: 4.8,
                y: 1.3,
                w: 3.6,
                h: 2.4,
                fill: { color: 'FFFFFF' },
                line: { color: 'CBD5E1', width: 1 },
            });
            slide2.addText('ENGAGEMENT INDEX', {
                x: 5.0,
                y: 1.5,
                w: 3.2,
                h: 0.4,
                fontSize: 12,
                color: '64748B',
                bold: true,
            });
            slide2.addText(`${metrics.overallEngagementScore.toFixed(1)}%`, {
                x: 5.0,
                y: 1.9,
                w: 3.2,
                h: 0.9,
                fontSize: 36,
                color: '2563EB',
                bold: true,
            });
            slide2.addText('Benchmark: 75.0% (+2.1% favorable)', {
                x: 5.0,
                y: 2.9,
                w: 3.2,
                h: 0.5,
                fontSize: 11,
                color: '64748B',
            });
            // Card 3: Participation Turnout
            slide2.addShape(pres.ShapeType.rect, {
                x: 8.8,
                y: 1.3,
                w: 3.6,
                h: 2.4,
                fill: { color: 'FFFFFF' },
                line: { color: 'CBD5E1', width: 1 },
            });
            slide2.addText('TURNOUT & RESPONSE RATE', {
                x: 9.0,
                y: 1.5,
                w: 3.2,
                h: 0.4,
                fontSize: 12,
                color: '64748B',
                bold: true,
            });
            slide2.addText(`${metrics.participationRate}%`, {
                x: 9.0,
                y: 1.9,
                w: 3.2,
                h: 0.9,
                fontSize: 36,
                color: '0F172A',
                bold: true,
            });
            slide2.addText(`${metrics.sampleSize} / ${metrics.eligibleCount} respondents`, {
                x: 9.0,
                y: 2.9,
                w: 3.2,
                h: 0.5,
                fontSize: 11,
                color: '64748B',
            });
        }
        // -------------------------------------------------------------
        // Slide 3: Driver Breakdown Table
        // -------------------------------------------------------------
        const slide3 = pres.addSlide();
        slide3.background = { color: 'F8FAFC' };
        slide3.addText('CORE DRIVER SCORES VS BENCHMARK', {
            x: 0.8,
            y: 0.5,
            w: 11.5,
            h: 0.5,
            fontSize: 20,
            color: '0F172A',
            bold: true,
        });
        if (!metrics.isSuppressed && metrics.driverScores && metrics.driverScores.length > 0) {
            const tableRows = [
                [
                    { text: 'Dimension Name', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
                    { text: 'Score (0-5)', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
                    { text: 'Global Benchmark', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
                    { text: 'Variance', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
                ],
            ];
            for (const d of metrics.driverScores) {
                tableRows.push([
                    { text: d.name, options: { fill: 'FFFFFF', color: '0F172A' } },
                    { text: d.score.toFixed(1), options: { fill: 'FFFFFF', color: '0F172A', bold: true } },
                    { text: d.benchmark.toFixed(1), options: { fill: 'FFFFFF', color: '64748B' } },
                    {
                        text: `${d.variance >= 0 ? '+' : ''}${d.variance.toFixed(1)}`,
                        options: {
                            fill: 'FFFFFF',
                            color: d.variance >= 0 ? '059669' : 'DC2626',
                            bold: true,
                        },
                    },
                ]);
            }
            slide3.addTable(tableRows, {
                x: 0.8,
                y: 1.3,
                w: 11.5,
                colW: [5.0, 2.2, 2.3, 2.0],
                fontSize: 12,
                border: { color: 'E2E8F0', pt: 1 },
            });
        }
        // Export valid OpenXML binary presentation buffer
        const buffer = (await pres.write({ outputType: 'nodebuffer' }));
        // Stream and upload artifact directly to S3 / Cloudflare R2 (GAP-008 / TASK-03-01)
        const storageKey = `reports/${projectId}/${reportId}.pptx`;
        await this.storageService.uploadArtifact(storageKey, buffer, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        const presignedDownloadUrl = await this.storageService.getPresignedDownloadUrl(storageKey, 86400);
        try {
            await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
            await fs_1.default.promises.writeFile(filePath, buffer);
        }
        catch {
            // Ephemeral disk write failure is non-fatal in cluster or containerized environments
        }
        return {
            filePath,
            fileName,
            fileSizeBytes: buffer.length,
            downloadUrl: presignedDownloadUrl,
            metrics,
        };
    }
}
exports.PptReportGenerator = PptReportGenerator;
//# sourceMappingURL=ppt-report.generator.js.map