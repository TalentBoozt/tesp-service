"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfReportGenerator = void 0;
exports.sanitizeHexColor = sanitizeHexColor;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const scoped_data_aggregator_service_1 = require("../services/scoped-data-aggregator.service");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
function sanitizeHexColor(color, fallback = '#0F172A') {
    if (!color || typeof color !== 'string')
        return fallback;
    const trimmed = color.trim();
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(trimmed) ? trimmed : fallback;
}
class PdfReportGenerator {
    aggregator = new scoped_data_aggregator_service_1.ScopedDataAggregatorService();
    storageService = storage_service_1.StorageService.getInstance();
    async generatePdfBuffer(options) {
        const { projectId, campaignId, title, scopeType, scopeFilter } = options;
        const metrics = await this.aggregator.aggregate(projectId, campaignId, scopeType, scopeFilter, options.bypassPrivacy);
        return this.renderPdfBuffer(title, metrics, options);
    }
    async generatePdf(options) {
        const { reportId, projectId, campaignId, title, scopeType, scopeFilter } = options;
        const metrics = await this.aggregator.aggregate(projectId, campaignId, scopeType, scopeFilter, options.bypassPrivacy);
        const fileName = `${reportId}.pdf`;
        const pdfBuffer = await this.renderPdfBuffer(title, metrics, options);
        // Stream and upload artifact directly to S3 / Cloud Storage (GAP-008 / TASK-04-02)
        const storageKey = `reports/${projectId}/${reportId}.pdf`;
        await this.storageService.uploadArtifact(storageKey, pdfBuffer, 'application/pdf');
        const presignedDownloadUrl = await this.storageService.getPresignedDownloadUrl(storageKey, 86400);
        const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
        const filePath = path_1.default.join(reportsDir, fileName);
        try {
            await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
            await fs_1.default.promises.writeFile(filePath, pdfBuffer);
        }
        catch {
            // Ephemeral disk write failure is non-fatal in cluster or containerized environments
        }
        return {
            filePath,
            fileName,
            fileSizeBytes: pdfBuffer.length,
            downloadUrl: presignedDownloadUrl,
            metrics,
            pdfBuffer,
        };
    }
    renderPdfBuffer(title, metrics, options) {
        return new Promise((resolve, reject) => {
            const orgName = options.branding?.organizationName || 'Survey Results Executive Report';
            const docOptions = {
                margin: 50,
                size: 'A4',
                info: {
                    Title: title,
                    Author: orgName,
                    Subject: 'Executive Survey Analytics & Scorecard',
                    CreationDate: new Date(),
                },
            };
            if (options.passwordProtected && options.pdfPassword) {
                docOptions.userPassword = options.pdfPassword;
                docOptions.ownerPassword = options.pdfPassword;
                docOptions.permissions = {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: true,
                };
            }
            const doc = new pdfkit_1.default(docOptions);
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            // Header Brand Accent
            const primaryColor = sanitizeHexColor(options.branding?.primaryColor, '#0F172A');
            doc.rect(50, 40, 495, 4).fill(primaryColor);
            // Title & Context
            const headerOrgText = options.branding?.organizationName || 'Survey Results Executive Report';
            doc.fontSize(10).fillColor('#64748B').text(headerOrgText, 50, 52, { characterSpacing: 1 });
            doc.fontSize(22).fillColor('#0F172A').text(title, 50, 68, { width: 495 });
            doc.moveDown(0.5);
            if (options.branding?.logoUrl && typeof options.branding.logoUrl === 'string') {
                try {
                    if (fs_1.default.existsSync(options.branding.logoUrl)) {
                        doc.image(options.branding.logoUrl, 420, 50, { fit: [120, 24] });
                    }
                }
                catch {
                    // Non-fatal if logo rendering fails
                }
            }
            const metaLine = `Tenant: ${metrics.projectId}  |  Campaign: ${metrics.campaignId}  |  Scope: ${metrics.scopeType}` +
                `${options.scopeFilter?.nodeName ? ' (' + options.scopeFilter.nodeName + ')' : ''}\n` +
                `Generated: ${new Date().toISOString().split('T')[0]}  |  Requested By: ${options.requestedBy || 'Executive Lead'}`;
            doc.fontSize(9).fillColor('#475569').text(metaLine);
            doc.moveDown(1);
            doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);
            if (metrics.isSuppressed) {
                doc.rect(50, doc.y, 495, 60).fill('#FEF2F2');
                doc.fillColor('#DC2626').fontSize(12).text('PRIVACY PROTECTION NOTICE', 65, doc.y - 50, { bold: true });
                doc.fillColor('#991B1B').fontSize(10).text(metrics.suppressionNotice ||
                    'Data suppressed: Sample size N < 5. Metrics have been masked to safeguard respondent anonymity.', 65, doc.y - 32, { width: 465 });
            }
            else {
                if (metrics.suppressionNotice) {
                    doc.rect(50, doc.y, 495, 28).fill('#EFF6FF');
                    doc.fillColor('#1D4ED8').fontSize(8.5).text(metrics.suppressionNotice, 65, doc.y - 21, { width: 465 });
                    doc.moveDown(1.2);
                }
                // Executive Scorecard Section
                doc.fontSize(13).fillColor('#0F172A').text('EXECUTIVE SCORECARD', { underline: true });
                doc.moveDown(0.5);
                // Three Column Metric Summary
                const startY = doc.y;
                // Col 1: eNPS
                doc.rect(50, startY, 155, 65).fillAndStroke('#F8FAFC', '#E2E8F0');
                doc.fillColor('#64748B').fontSize(9).text('eNPS SCORE', 60, startY + 10);
                doc.fillColor(metrics.enpsScore >= 20 ? '#059669' : '#D97706').fontSize(20).text(`${metrics.enpsScore > 0 ? '+' : ''}${metrics.enpsScore.toFixed(1)}`, 60, startY + 24);
                doc.fillColor('#64748B').fontSize(8).text(`${metrics.promotersPercent}% Promoters | ${metrics.detractorsPercent}% Detractors`, 60, startY + 48);
                // Col 2: Engagement Score
                doc.rect(220, startY, 155, 65).fillAndStroke('#F8FAFC', '#E2E8F0');
                doc.fillColor('#64748B').fontSize(9).text('ENGAGEMENT INDEX', 230, startY + 10);
                doc.fillColor('#2563EB').fontSize(20).text(`${metrics.overallEngagementScore.toFixed(1)}%`, 230, startY + 24);
                if (options.includeBenchmarkComparison !== false && options.benchmark !== undefined && options.benchmark !== null) {
                    const variance = metrics.overallEngagementScore - options.benchmark;
                    const varSign = variance >= 0 ? '+' : '';
                    doc.fillColor('#64748B').fontSize(8).text(`Benchmark: ${options.benchmark}% (${varSign}${variance.toFixed(1)}%)`, 230, startY + 48);
                }
                // Col 3: Participation
                doc.rect(390, startY, 155, 65).fillAndStroke('#F8FAFC', '#E2E8F0');
                doc.fillColor('#64748B').fontSize(9).text('RESPONSE RATE', 400, startY + 10);
                doc.fillColor('#0F172A').fontSize(20).text(`${metrics.participationRate}%`, 400, startY + 24);
                doc.fillColor('#64748B').fontSize(8).text(`${metrics.sampleSize} of ${metrics.eligibleCount} respondents`, 400, startY + 48);
                doc.y = startY + 80;
                doc.moveDown(0.5);
                // Core Driver Scores Table
                if (metrics.driverScores && metrics.driverScores.length > 0) {
                    doc.fontSize(13).fillColor('#0F172A').text('CORE ENGAGEMENT DRIVER SCORES', { underline: true });
                    doc.moveDown(0.5);
                    // Table Header
                    const tableY = doc.y;
                    doc.rect(50, tableY, 495, 20).fill('#1E293B');
                    doc.fillColor('#FFFFFF').fontSize(9);
                    doc.text('Engagement Dimension', 60, tableY + 5);
                    doc.text('Score (0-5)', 310, tableY + 5);
                    doc.text('Benchmark', 390, tableY + 5);
                    doc.text('Variance', 470, tableY + 5);
                    let rowY = tableY + 20;
                    for (let i = 0; i < metrics.driverScores.length; i++) {
                        const d = metrics.driverScores[i];
                        const bg = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                        doc.rect(50, rowY, 495, 20).fillAndStroke(bg, '#F1F5F9');
                        doc.fillColor('#0F172A').fontSize(9).text(d.name, 60, rowY + 5);
                        doc.fillColor('#0F172A').fontSize(9).text(d.score.toFixed(1), 310, rowY + 5);
                        doc.fillColor('#64748B').fontSize(9).text(d.benchmark.toFixed(1), 390, rowY + 5);
                        const isPositive = d.variance >= 0;
                        doc.fillColor(isPositive ? '#059669' : '#DC2626').fontSize(9).text(`${isPositive ? '+' : ''}${d.variance.toFixed(1)}`, 470, rowY + 5);
                        rowY += 20;
                    }
                    doc.y = rowY + 10;
                }
                // AI Sentiment Breakdown
                if (metrics.aiSentiment) {
                    doc.moveDown(0.5);
                    doc.fontSize(13).fillColor('#0F172A').text('QUALITATIVE AI SENTIMENT SYNTHESIS', { underline: true });
                    doc.moveDown(0.3);
                    const sent = metrics.aiSentiment;
                    doc.fontSize(9).fillColor('#334155').text(`Sentiment Distribution: ${sent.positivePercent}% Positive  |  ${sent.neutralPercent}% Neutral  |  ${sent.negativePercent}% Negative`);
                    if (sent.topThemes && sent.topThemes.length > 0) {
                        doc.text(`Key Identified Themes: ${sent.topThemes.map((t) => `${t.theme} (${t.count})`).join(', ')}`);
                    }
                    if (sent.verbatimHighlights && sent.verbatimHighlights.length > 0) {
                        doc.moveDown(0.3);
                        doc.font('Helvetica-Oblique').fillColor('#475569').text(`"${sent.verbatimHighlights[0]}"`);
                        doc.font('Helvetica');
                    }
                }
            }
            // Footer
            const footerOrg = options.branding?.organizationName || 'Survey Results Executive Report';
            doc.fontSize(8).fillColor('#94A3B8').text(`Generated by ${footerOrg} — Confidential & Proprietary`, 50, 750, { align: 'center', width: 495 });
            doc.end();
        });
    }
}
exports.PdfReportGenerator = PdfReportGenerator;
//# sourceMappingURL=pdf-report.generator.js.map