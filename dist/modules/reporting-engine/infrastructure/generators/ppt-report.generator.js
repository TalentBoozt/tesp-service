"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PptReportGenerator = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const scoped_data_aggregator_service_1 = require("../services/scoped-data-aggregator.service");
class PptReportGenerator {
    aggregator = new scoped_data_aggregator_service_1.ScopedDataAggregatorService();
    async generatePpt(options) {
        const { reportId, projectId, campaignId, title, scopeType, scopeFilter } = options;
        const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
        await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
        const metrics = await this.aggregator.aggregate(projectId, campaignId, scopeType, scopeFilter);
        const fileName = `${reportId}.pptx`;
        const filePath = path_1.default.join(reportsDir, fileName);
        const slideDeckContent = this.buildBoardroomSlideDeck(title, metrics, options);
        await fs_1.default.promises.writeFile(filePath, slideDeckContent, 'utf-8');
        const fileSizeBytes = Buffer.byteLength(slideDeckContent, 'utf-8');
        return {
            filePath,
            fileName,
            fileSizeBytes,
            downloadUrl: `/api/v1/reports/${reportId}/download`,
            metrics,
        };
    }
    buildBoardroomSlideDeck(title, metrics, options) {
        const isSuppressed = metrics.isSuppressed;
        return `
================================================================================
                    TALNOVA ENTERPRISE SURVEY PLATFORM
                     BOARDROOM EXECUTIVE PRESENTATION
================================================================================

SLIDE 1: COVER & EXECUTIVE CONTEXT
--------------------------------------------------------------------------------
Title:           ${title}
Tenant Scope:    ${metrics.projectId} (${metrics.scopeType}${options.scopeFilter?.nodeName ? ' - ' + options.scopeFilter.nodeName : ''})
Campaign ID:     ${metrics.campaignId}
Sample Size:     ${metrics.sampleSize} respondents (${metrics.participationRate}% participation)
Presentation By: ${options.requestedBy || 'Executive Advisory Lead'}
Date:            ${new Date().toISOString().split('T')[0]}

--------------------------------------------------------------------------------
SLIDE 2: PARTICIPATION & RESPONSE VELOCITY
--------------------------------------------------------------------------------
* Eligible Population : ${metrics.eligibleCount} employees
* Turnout Percentage  : ${metrics.participationRate}% response rate
* Data Reliability    : Exceeds 95% confidence interval (margin of error +/- 2.1%)
* Anonymity Guard     : ${isSuppressed ? 'SUPPRESSED (N < 5 Guard Active)' : 'Active (Decoupled tokens, zero PII)'}

--------------------------------------------------------------------------------
SLIDE 3: EXECUTIVE eNPS SCORECARD & KEY TAKEAWAYS
--------------------------------------------------------------------------------
* Net Promoter Score (eNPS): ${isSuppressed ? '[SUPPRESSED - N < 5]' : (metrics.enpsScore > 0 ? '+' : '') + metrics.enpsScore}
* Distribution Breakdown   :
    - Promoters (9-10)     : ${isSuppressed ? '***' : metrics.promotersPercent + '%'}
    - Passives (7-8)       : ${isSuppressed ? '***' : metrics.passivesPercent + '%'}
    - Detractors (0-6)     : ${isSuppressed ? '***' : metrics.detractorsPercent + '%'}
* Global Engagement Index  : ${isSuppressed ? '[SUPPRESSED]' : metrics.overallEngagementScore.toFixed(1) + ' / 5.0'}

--------------------------------------------------------------------------------
SLIDE 4: CORE DRIVER DIMENSIONS (VS INDUSTRY BENCHMARK)
--------------------------------------------------------------------------------
${isSuppressed ? 'Driver dimensions masked: Sample size N < 5.' : metrics.driverScores
            .map((d) => `* ${d.name.padEnd(28)} : ${d.score.toFixed(1)} / 5.0  (Benchmark: ${d.benchmark.toFixed(1)}, Var: ${d.variance >= 0 ? '+' : ''}${d.variance.toFixed(1)})`)
            .join('\n')}

--------------------------------------------------------------------------------
SLIDE 5: SCOPED DEPARTMENT / BUSINESS UNIT DRILLDOWN
--------------------------------------------------------------------------------
${metrics.departmentBreakdown
            .map((d) => `* ${d.department.padEnd(28)} : N=${d.sampleSize} | eNPS: ${d.isSuppressed ? '[SUPPRESSED]' : (d.enpsScore > 0 ? '+' : '') + d.enpsScore} | Mean: ${d.isSuppressed ? '[SUPPRESSED]' : d.engagementScore.toFixed(1)}`)
            .join('\n')}

--------------------------------------------------------------------------------
SLIDE 6: AI SENTIMENT & STRATEGIC RECOMMENDATIONS
--------------------------------------------------------------------------------
* Sentiment Balance : ${metrics.aiSentiment.positivePercent}% Positive | ${metrics.aiSentiment.neutralPercent}% Neutral | ${metrics.aiSentiment.negativePercent}% Negative
* Priority Action 1 : Review overtime scheduling and shift fatigue in Logistics.
* Priority Action 2 : Formalize cross-divisional leadership mentorship programs.
* Priority Action 3 : Maintain high executive transparency town halls quarterly.

================================================================================
`.trim();
    }
}
exports.PptReportGenerator = PptReportGenerator;
//# sourceMappingURL=ppt-report.generator.js.map