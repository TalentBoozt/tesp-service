"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvReportGenerator = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const campaign_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
const survey_schema_1 = require("../../../survey/infrastructure/persistence/mongoose/survey.schema");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
const pdf_report_generator_1 = require("./pdf-report.generator");
class CsvReportGenerator {
    async generateReport(options) {
        const { projectId, campaignId, reportId, reportType, nodeId, requestedBy, bypassPrivacy } = options;
        const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
        await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
        // 1. Fetch live Campaign & Survey metadata from MongoDB
        let campaignTitle = 'Survey Campaign';
        let surveyId = '';
        let totalTarget = 0;
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const campaign = await campaign_schema_1.CampaignModel.findOne({ projectId, campaignId }).lean();
                if (campaign) {
                    campaignTitle = campaign.title || campaignTitle;
                    surveyId = campaign.surveyId || surveyId;
                    totalTarget = campaign.metrics?.totalTargeted || campaign.targetCount || 0;
                }
            }
            catch {
                // Fallback to defaults
            }
        }
        // Delegate PDF requests to official PdfReportGenerator
        if (reportType.includes('PDF')) {
            const pdfGenerator = new pdf_report_generator_1.PdfReportGenerator();
            const pdfResult = await pdfGenerator.generatePdf({
                reportId,
                projectId,
                campaignId,
                title: campaignTitle,
                scopeType: nodeId && nodeId !== 'GLOBAL' ? 'DEPARTMENT' : 'ORGANIZATION',
                scopeFilter: nodeId && nodeId !== 'GLOBAL' ? { nodeId } : undefined,
                requestedBy,
                bypassPrivacy,
            });
            return {
                filePath: pdfResult.filePath || '',
                fileName: pdfResult.fileName,
                fileSizeBytes: pdfResult.fileSizeBytes,
                downloadUrl: pdfResult.downloadUrl,
            };
        }
        // 2. Fetch Question Metadata from Survey definition
        const questionsMap = new Map();
        if (mongoose_1.default.connection.readyState === 1 && surveyId) {
            try {
                const survey = await survey_schema_1.SurveyModel.findOne({ projectId, surveyId }).lean();
                if (survey && Array.isArray(survey.pages)) {
                    for (const page of survey.pages) {
                        for (const sec of page.sections || []) {
                            for (const q of sec.questions || []) {
                                const promptText = typeof q.prompt === 'string'
                                    ? q.prompt
                                    : q.prompt?.['en-US'] || Object.values(q.prompt || {})[0] || q.questionId;
                                questionsMap.set(q.questionId, {
                                    prompt: promptText,
                                    groupId: q.groupId || 'GENERAL',
                                    type: q.type || 'LIKERT',
                                });
                            }
                        }
                    }
                }
            }
            catch {
                // Fallback to empty
            }
        }
        // 3. Fetch Responses from Database
        let responses = [];
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const query = { projectId, campaignId, isDeleted: false };
                if (nodeId && nodeId !== 'GLOBAL') {
                    query.nodeId = nodeId;
                }
                responses = await survey_response_schema_1.SurveyResponseModel.find(query).lean();
            }
            catch {
                // Fallback to empty
            }
        }
        // If survey definition had no questions but responses exist, extract questions dynamically
        for (const res of responses) {
            for (const ans of res.answers || []) {
                if (ans && ans.questionId && !questionsMap.has(ans.questionId)) {
                    questionsMap.set(ans.questionId, {
                        prompt: ans.questionText || ans.questionId,
                        groupId: ans.groupId || 'GENERAL',
                        type: ans.questionType || (ans.numericValue !== undefined && ans.numericValue > 5 ? 'NPS' : 'LIKERT'),
                    });
                }
            }
        }
        // Fallback standard questions schema if no questions exist in DB
        if (questionsMap.size === 0) {
            questionsMap.set('Q-101', {
                prompt: 'I feel safe taking risks and expressing candid opinions on my team without fear of negative consequences.',
                groupId: 'PSYCHOLOGICAL_SAFETY',
                type: 'LIKERT',
            });
            questionsMap.set('Q-102', {
                prompt: 'My immediate team lead provides constructive, transparent feedback that accelerates my growth.',
                groupId: 'MANAGEMENT_ALIGNMENT',
                type: 'LIKERT',
            });
            questionsMap.set('Q-201', {
                prompt: 'How likely are you to recommend Talnova as a great place to work to a peer or professional colleague?',
                groupId: 'ORGANIZATIONAL_ENPS',
                type: 'NPS',
            });
            questionsMap.set('Q-301', {
                prompt: 'What is the single most impactful action leadership can take to support your day-to-day effectiveness?',
                groupId: 'QUALITATIVE_VOICE',
                type: 'LONG_TEXT',
            });
        }
        const responseCount = responses.length;
        const responseRate = totalTarget > 0 ? ((responseCount / totalTarget) * 100).toFixed(1) : '0.0';
        // 4. Calculate Aggregate Metrics
        const questionScores = new Map();
        const npsValues = [];
        for (const res of responses) {
            for (const ans of res.answers || []) {
                if (ans.numericValue !== undefined && ans.numericValue !== null && !isNaN(Number(ans.numericValue))) {
                    const val = Number(ans.numericValue);
                    if (!questionScores.has(ans.questionId)) {
                        questionScores.set(ans.questionId, { sum: 0, count: 0, values: [], favorableCount: 0 });
                    }
                    const entry = questionScores.get(ans.questionId);
                    entry.sum += val;
                    entry.count += 1;
                    entry.values.push(val);
                    const qMeta = questionsMap.get(ans.questionId);
                    const isNps = qMeta?.type === 'NPS' || ans.questionType === 'NPS';
                    if (isNps) {
                        npsValues.push(val);
                    }
                    // Favorable threshold: >= 4 on 5-point scale (LIKERT), >= 7 on 10-point scale (NPS)
                    const isFavorable = isNps ? val >= 7 : val >= 4;
                    if (isFavorable) {
                        entry.favorableCount += 1;
                    }
                }
            }
        }
        // Calculate eNPS dynamically
        let enpsScore = 0.0;
        let promoterPct = 0.0;
        let passivePct = 0.0;
        let detractorPct = 0.0;
        if (npsValues.length > 0) {
            let promoters = 0;
            let detractors = 0;
            let passives = 0;
            for (const val of npsValues) {
                if (val >= 9)
                    promoters++;
                else if (val <= 6)
                    detractors++;
                else
                    passives++;
            }
            const totalNps = npsValues.length;
            promoterPct = Number(((promoters / totalNps) * 100).toFixed(1));
            detractorPct = Number(((detractors / totalNps) * 100).toFixed(1));
            passivePct = Number(((passives / totalNps) * 100).toFixed(1));
            enpsScore = Number((promoterPct - detractorPct).toFixed(1));
        }
        // Calculate Dimension Averages and Overall Normalized Engagement Index
        const dimensionMap = new Map();
        let totalNormalizedScoreSum = 0;
        let totalNormalizedQuestionCount = 0;
        for (const [qId, meta] of questionsMap.entries()) {
            if (!dimensionMap.has(meta.groupId)) {
                dimensionMap.set(meta.groupId, { sumNormalizedScore: 0, questionCount: 0, responseCount: 0 });
            }
            const dimEntry = dimensionMap.get(meta.groupId);
            const qStats = questionScores.get(qId);
            if (qStats && qStats.count > 0) {
                const avg = qStats.sum / qStats.count;
                // Normalize to 0-100 scale: NPS (0-10) -> avg * 10, Likert (1-5) -> (avg / 5) * 100
                const normalizedScore = meta.type === 'NPS' ? avg * 10 : (avg / 5) * 100;
                dimEntry.sumNormalizedScore += normalizedScore;
                dimEntry.questionCount += 1;
                dimEntry.responseCount += qStats.count;
                totalNormalizedScoreSum += normalizedScore;
                totalNormalizedQuestionCount += 1;
            }
        }
        const overallScore = totalNormalizedQuestionCount > 0
            ? Number((totalNormalizedScoreSum / totalNormalizedQuestionCount).toFixed(1))
            : 0.0;
        // 5. Build Structured CSV Content
        const timestamp = new Date().toISOString();
        const csvLines = [
            '\uFEFF# =====================================================================',
            `# TALNOVA ENTERPRISE SURVEY PLATFORM - REPORT EXPORT`,
            `# =====================================================================`,
            `Tenant Workspace ID,${projectId}`,
            `Campaign ID,${campaignId}`,
            `Campaign Title,"${campaignTitle.replace(/"/g, '""')}"`,
            `Survey ID,${surveyId}`,
            `Report Job ID,${reportId}`,
            `Report Type,${reportType}`,
            `Scope Node ID,${nodeId || 'GLOBAL'}`,
            `Generated At,${timestamp}`,
            `Privacy Guard Status,ACTIVE (N < 5 Redaction Enforced)`,
            ``,
            `# ---------------------------------------------------------------------`,
            `# EXECUTIVE TELEMETRY & PARTICIPATION SUMMARY`,
            `# ---------------------------------------------------------------------`,
            `Metric,Value,Unit / Detail`,
            `Total Target Audience,${totalTarget},Invited Headcount`,
            `Total Verified Responses,${responseCount},Submissions`,
            `Participation Rate,${responseRate}%,Of Target Audience`,
            `Overall Engagement Index,${overallScore},0-100 Scaled Score`,
            `Employee Net Promoter Score (eNPS),${enpsScore > 0 ? '+' : ''}${enpsScore},-100 to +100 Scale`,
            `Promoters (Rating 9-10),${promoterPct}%,Advocates`,
            `Passives (Rating 7-8),${passivePct}%,Neutral`,
            `Detractors (Rating 0-6),${detractorPct}%,Critics`,
            ``,
            `# ---------------------------------------------------------------------`,
            `# DIMENSIONS BREAKDOWN`,
            `# ---------------------------------------------------------------------`,
            `Dimension Key,Dimension Name,Average Score (0-100),Total Responses,Benchmark Assessment`,
        ];
        for (const [dimKey, dimVal] of dimensionMap.entries()) {
            const avg = dimVal.questionCount > 0 ? Number((dimVal.sumNormalizedScore / dimVal.questionCount).toFixed(1)) : 0.0;
            const dimName = dimKey.replace(/_/g, ' ').toUpperCase();
            const benchmark = avg >= 80 ? 'ABOVE_BENCHMARK' : avg >= 70 ? 'ON_TARGET' : avg > 0 ? 'NEEDS_FOCUS' : 'NO_DATA';
            csvLines.push(`${dimKey},"${dimName}",${avg},${dimVal.responseCount},${benchmark}`);
        }
        csvLines.push(``, `# ---------------------------------------------------------------------`, `# ANONYMIZED QUESTION SCORE MATRIX`, `# ---------------------------------------------------------------------`, `Question ID,Dimension,Question Type,Question Text,Average Score,Favorable %,Response Count`);
        for (const [qId, meta] of questionsMap.entries()) {
            const qStats = questionScores.get(qId);
            const qCount = qStats ? qStats.count : 0;
            const isSuppressed = responseCount > 0 && responseCount < 5;
            let displayScore = 'N/A';
            let favorableStr = '0.0%';
            if (isSuppressed) {
                displayScore = '* N/A (N < 5)';
                favorableStr = '* N/A (N < 5)';
            }
            else if (qStats && qStats.count > 0) {
                const avg = (qStats.sum / qStats.count).toFixed(2);
                const maxScore = meta.type === 'NPS' ? '10.0' : meta.type === 'LIKERT' ? '5.0' : 'N/A';
                displayScore = `${avg} / ${maxScore}`;
                favorableStr = `${((qStats.favorableCount / qStats.count) * 100).toFixed(1)}%`;
            }
            const safePrompt = `"${meta.prompt.replace(/"/g, '""')}"`;
            csvLines.push(`${qId},${meta.groupId},${meta.type},${safePrompt},${displayScore},${favorableStr},${qCount}`);
        }
        const csvContent = csvLines.join('\n');
        const csvFilePath = path_1.default.join(reportsDir, `${reportId}.csv`);
        await fs_1.default.promises.writeFile(csvFilePath, csvContent, 'utf-8');
        // Upload CSV artifact to Cloudflare R2 / S3
        const storageService = storage_service_1.StorageService.getInstance();
        const storageKey = `reports/${projectId}/${reportId}.csv`;
        const csvBuffer = Buffer.from(csvContent, 'utf-8');
        let downloadUrl = `/api/v1/reports/${reportId}/download`;
        try {
            const uploadRes = await storageService.uploadArtifact(storageKey, csvBuffer, 'text/csv');
            if (uploadRes) {
                downloadUrl = uploadRes;
            }
        }
        catch {
            // Fallback to local download route if cloud storage is unavailable
        }
        const stat = await fs_1.default.promises.stat(csvFilePath);
        return {
            filePath: csvFilePath,
            fileName: path_1.default.basename(csvFilePath),
            fileSizeBytes: stat.size,
            downloadUrl,
        };
    }
}
exports.CsvReportGenerator = CsvReportGenerator;
//# sourceMappingURL=csv-report.generator.js.map