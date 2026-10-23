"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetExecutiveSummaryUseCase = void 0;
const openai_gemini_adapter_1 = require("../adapters/openai-gemini.adapter");
const analyze_text_responses_use_case_1 = require("./analyze-text-responses.use-case");
class GetExecutiveSummaryUseCase {
    aiInsightRepo;
    aiProvider;
    responseRepo;
    constructor(aiInsightRepo, aiProvider = new openai_gemini_adapter_1.OpenAiGeminiAdapter(), responseRepo) {
        this.aiInsightRepo = aiInsightRepo;
        this.aiProvider = aiProvider;
        this.responseRepo = responseRepo;
    }
    async execute(projectId, campaignId, nodeId = 'GLOBAL') {
        let insights = await this.aiInsightRepo.findAllByCampaign(projectId, campaignId, nodeId);
        // If no pre-computed insights exist but response repo is available, run text analysis on the fly
        if (insights.length === 0 && this.responseRepo) {
            try {
                const analyzer = new analyze_text_responses_use_case_1.AnalyzeTextResponsesUseCase(this.aiInsightRepo, this.responseRepo, this.aiProvider);
                await analyzer.execute(projectId, campaignId);
                insights = await this.aiInsightRepo.findAllByCampaign(projectId, campaignId, nodeId);
            }
            catch (err) {
                console.warn('Auto-analysis on executive summary fetch caught error:', err);
            }
        }
        if (insights.length === 0) {
            const emptyMsg = 'No qualitative comments submitted yet for this campaign. Qualitative sentiment and AI theme clusters will appear once open-ended responses are received.';
            return {
                campaignId,
                nodeId,
                overallSentiment: 'NEUTRAL',
                averageSentimentScore: 0.0,
                overallSentimentScore: 0.0,
                totalCommentsAnalyzed: 0,
                executiveSummary: emptyMsg,
                summaryText: emptyMsg,
                sentimentBreakdown: {
                    positivePercentage: 0,
                    neutralPercentage: 0,
                    negativePercentage: 0,
                },
                keyThemes: [],
                recommendedActions: [],
                topStrengths: [],
                topConcerns: [],
                recommendations: [],
            };
        }
        // 1. Calculate sentiment scores and breakdown
        let totalScore = 0;
        let posCount = 0;
        let neuCount = 0;
        let negCount = 0;
        for (const i of insights) {
            totalScore += i.sentimentScore;
            if (i.sentimentLabel === 'POSITIVE')
                posCount++;
            else if (i.sentimentLabel === 'NEGATIVE')
                negCount++;
            else
                neuCount++;
        }
        const total = insights.length;
        const avgScore = Math.round((totalScore / total) * 100) / 100;
        const positivePercentage = Math.round((posCount / total) * 100);
        const neutralPercentage = Math.round((neuCount / total) * 100);
        const negativePercentage = Math.max(0, 100 - positivePercentage - neutralPercentage);
        let overallSentiment = 'NEUTRAL';
        if (avgScore >= 0.2)
            overallSentiment = 'POSITIVE';
        else if (avgScore <= -0.2)
            overallSentiment = 'NEGATIVE';
        // 2. Aggregate Theme Clusters with real quotes
        const themeMap = new Map();
        for (const i of insights) {
            const themes = i.themes && i.themes.length > 0 ? i.themes : ['General Workplace Feedback'];
            for (const t of themes) {
                if (!themeMap.has(t)) {
                    themeMap.set(t, { theme: t, scores: [], labels: [], quotes: [] });
                }
                const record = themeMap.get(t);
                record.scores.push(i.sentimentScore);
                record.labels.push(i.sentimentLabel);
                if (i.sanitizedText && !record.quotes.includes(i.sanitizedText) && record.quotes.length < 3) {
                    record.quotes.push(i.sanitizedText);
                }
            }
        }
        const keyThemes = [];
        let themeIndex = 1;
        for (const [themeName, data] of themeMap.entries()) {
            const themeAvgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            let themeSentiment = 'NEUTRAL';
            if (themeAvgScore >= 0.2)
                themeSentiment = 'POSITIVE';
            else if (themeAvgScore <= -0.2)
                themeSentiment = 'NEGATIVE';
            const mentionCount = data.scores.length;
            const impactScore = Math.round((5.0 + Math.min(4.5, (mentionCount / total) * 5 + Math.abs(themeAvgScore) * 2)) * 10) / 10;
            keyThemes.push({
                id: `theme-${themeIndex++}`,
                theme: themeName,
                sentiment: themeSentiment,
                mentionCount,
                impactScore,
                sampleQuotes: data.quotes,
            });
        }
        // Sort by mention count descending
        keyThemes.sort((a, b) => b.mentionCount - a.mentionCount);
        // 3. Generate summary narrative & recommendations
        const sanitizedComments = insights.map((i) => i.sanitizedText);
        const summaryPayload = await this.aiProvider.generateExecutiveSummary(nodeId, sanitizedComments);
        const topThemeNames = keyThemes.slice(0, 2).map((t) => t.theme).join(' and ');
        const polarityStr = (avgScore >= 0 ? '+' : '') + avgScore.toFixed(2);
        const executiveSummary = `AI sentiment analysis across ${total} verbatim comments indicates ${positivePercentage}% positive, ${neutralPercentage}% neutral, and ${negativePercentage}% negative sentiment. Primary feedback themes center on ${topThemeNames || 'workplace culture'}. Overall sentiment polarity stands at ${polarityStr}.`;
        // Construct recommended actions based on negative or neutral themes
        const dynamicActions = [];
        const negativeThemes = keyThemes.filter((t) => t.sentiment === 'NEGATIVE');
        for (const nt of negativeThemes) {
            dynamicActions.push(`Initiate targeted action plan addressing concerns in ${nt.theme}.`);
        }
        if (dynamicActions.length === 0) {
            dynamicActions.push('Sustain positive leadership engagement practices and celebrate current team milestones.');
            dynamicActions.push('Schedule quarterly pulse reviews to track ongoing sentiment trajectory.');
        }
        return {
            campaignId,
            nodeId,
            overallSentiment,
            averageSentimentScore: avgScore,
            overallSentimentScore: avgScore,
            totalCommentsAnalyzed: total,
            executiveSummary,
            summaryText: executiveSummary,
            sentimentBreakdown: {
                positivePercentage,
                neutralPercentage,
                negativePercentage,
            },
            keyThemes,
            recommendedActions: dynamicActions.length > 0 ? dynamicActions : summaryPayload.recommendations,
            topStrengths: summaryPayload.strengths,
            topConcerns: summaryPayload.concerns,
            recommendations: summaryPayload.recommendations,
        };
    }
}
exports.GetExecutiveSummaryUseCase = GetExecutiveSummaryUseCase;
//# sourceMappingURL=get-executive-summary.use-case.js.map