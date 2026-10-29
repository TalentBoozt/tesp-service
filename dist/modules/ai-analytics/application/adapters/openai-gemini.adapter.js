"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiGeminiAdapter = void 0;
const sentiment_classifier_service_1 = require("../../domain/services/sentiment-classifier.service");
const theme_clustering_service_1 = require("../../domain/services/theme-clustering.service");
class OpenAiGeminiAdapter {
    sentimentClassifier;
    themeClustering;
    clientAiConfig;
    constructor(clientAiConfig) {
        this.sentimentClassifier = new sentiment_classifier_service_1.SentimentClassifierService();
        this.themeClustering = new theme_clustering_service_1.ThemeClusteringService();
        this.clientAiConfig = clientAiConfig;
    }
    setClientConfig(config) {
        this.clientAiConfig = config;
    }
    isConfigured() {
        const provider = this.resolveProvider();
        const apiKey = this.resolveApiKey(provider);
        return Boolean(apiKey && apiKey.trim().length > 0 && provider !== 'MOCK');
    }
    /**
     * Resolve active API key either from tenant ProjectConfig or environment variables
     */
    resolveApiKey(provider) {
        if (this.clientAiConfig?.apiKey && this.clientAiConfig.apiKey.trim().length > 0) {
            const trimmed = this.clientAiConfig.apiKey.trim();
            if (!trimmed.startsWith('••••') && !trimmed.includes('••••')) {
                return trimmed;
            }
        }
        if (provider === 'OPENAI') {
            return process.env.OPENAI_API_KEY;
        }
        if (provider === 'GEMINI') {
            return process.env.GEMINI_API_KEY;
        }
        return process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    }
    /**
     * Determine the effective AI provider
     */
    resolveProvider() {
        if (this.clientAiConfig?.provider === 'OPENAI')
            return 'OPENAI';
        if (this.clientAiConfig?.provider === 'GEMINI')
            return 'GEMINI';
        if (this.clientAiConfig?.provider === 'MOCK')
            return 'MOCK';
        if (process.env.OPENAI_API_KEY)
            return 'OPENAI';
        if (process.env.GEMINI_API_KEY)
            return 'GEMINI';
        return 'MOCK';
    }
    /**
     * Perform single-text sentiment and thematic inference
     */
    async analyzeText(sanitizedText) {
        if (!sanitizedText || sanitizedText.trim().length === 0) {
            return {
                sentimentScore: 0,
                sentimentLabel: 'NEUTRAL',
                confidence: 1.0,
                themes: ['General Feedback'],
                isAiSimulated: false,
            };
        }
        const provider = this.resolveProvider();
        const apiKey = this.resolveApiKey(provider);
        if (apiKey && provider !== 'MOCK') {
            try {
                let result;
                if (provider === 'OPENAI') {
                    result = await this.callOpenAiAnalyze(sanitizedText, apiKey);
                }
                else if (provider === 'GEMINI') {
                    result = await this.callGeminiAnalyze(sanitizedText, apiKey);
                }
                else {
                    throw new Error(`Unsupported provider: ${provider}`);
                }
                return {
                    ...result,
                    isAiSimulated: false,
                };
            }
            catch (err) {
                const rawMsg = err?.message || String(err);
                const safeMsg = apiKey ? rawMsg.split(apiKey).join('[REDACTED]') : rawMsg;
                console.warn(`[AI-Analytics] Online ${provider} inference failed, falling back to local engine: ${safeMsg}`);
                const classification = this.sentimentClassifier.classifyText(sanitizedText);
                const themes = this.themeClustering.extractThemes(sanitizedText);
                return {
                    ...classification,
                    themes: themes.length > 0 ? themes : ['General Workplace Feedback'],
                    isAiSimulated: true,
                    fallbackReason: safeMsg,
                };
            }
        }
        // Dynamic local heuristic classifier fallback (used in test/offline modes)
        const classification = this.sentimentClassifier.classifyText(sanitizedText);
        const themes = this.themeClustering.extractThemes(sanitizedText);
        return {
            ...classification,
            themes: themes.length > 0 ? themes : ['General Workplace Feedback'],
            isAiSimulated: true,
            fallbackReason: provider === 'MOCK' ? 'Mock provider configured' : 'No AI API key configured',
        };
    }
    /**
     * Synthesize executive insights, concerns, and strategic recommendations from employee comments
     */
    async generateExecutiveSummary(nodeId, sanitizedComments) {
        if (!sanitizedComments || sanitizedComments.length === 0) {
            return {
                strengths: [],
                concerns: [],
                recommendations: [],
                isAiSimulated: false,
            };
        }
        const provider = this.resolveProvider();
        const apiKey = this.resolveApiKey(provider);
        if (apiKey && provider !== 'MOCK') {
            try {
                let res;
                if (provider === 'OPENAI') {
                    res = await this.callOpenAiSummary(nodeId, sanitizedComments, apiKey);
                }
                else if (provider === 'GEMINI') {
                    res = await this.callGeminiSummary(nodeId, sanitizedComments, apiKey);
                }
                else {
                    throw new Error(`Unsupported provider: ${provider}`);
                }
                return {
                    ...res,
                    isAiSimulated: false,
                };
            }
            catch (err) {
                const rawMsg = err?.message || String(err);
                const safeMsg = apiKey ? rawMsg.split(apiKey).join('[REDACTED]') : rawMsg;
                console.warn(`[AI-Analytics] ${provider} executive summary failed, generating dynamic fallback: ${safeMsg}`);
                const fallback = this.generateDynamicLocalSummary(nodeId, sanitizedComments);
                return {
                    ...fallback,
                    isAiSimulated: true,
                };
            }
        }
        // Grounded dynamic generation based on actual submitted comments (never static canned text)
        return this.generateDynamicLocalSummary(nodeId, sanitizedComments);
    }
    // =========================================================================
    // OpenAI REST Endpoints
    // =========================================================================
    async callOpenAiAnalyze(text, apiKey) {
        const baseUrl = this.clientAiConfig?.baseUrl || 'https://api.openai.com/v1';
        const model = this.clientAiConfig?.modelName || 'gpt-4o-mini';
        const systemPrompt = 'You are an enterprise sentiment and thematic analysis engine. Analyze the given employee survey comment. ' +
            'Return ONLY a JSON object with: ' +
            'sentimentScore (number between -1.0 and 1.0), ' +
            'sentimentLabel (one of: "POSITIVE", "NEUTRAL", "NEGATIVE"), ' +
            'confidence (number between 0.0 and 1.0), ' +
            'and themes (array of 1 to 3 concise topic tags like ["Leadership", "Work-Life Balance"]).';
        const body = {
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 300,
        };
        const response = await this.fetchWithRetry(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
        }
        const json = await response.json();
        const parsed = JSON.parse(json.choices?.[0]?.message?.content || '{}');
        const score = typeof parsed.sentimentScore === 'number' ? Math.max(-1, Math.min(1, parsed.sentimentScore)) : 0;
        const label = parsed.sentimentLabel === 'POSITIVE' || parsed.sentimentLabel === 'NEGATIVE' ? parsed.sentimentLabel : 'NEUTRAL';
        const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.85;
        const themes = Array.isArray(parsed.themes) && parsed.themes.length > 0 ? parsed.themes : ['General Workplace'];
        return { sentimentScore: score, sentimentLabel: label, confidence, themes };
    }
    async callOpenAiSummary(nodeId, comments, apiKey) {
        const baseUrl = this.clientAiConfig?.baseUrl || 'https://api.openai.com/v1';
        const model = this.clientAiConfig?.modelName || 'gpt-4o-mini';
        const promptText = `Analyze the following ${comments.length} verbatim employee comments from organization unit '${nodeId}'.\n\n` +
            comments.slice(0, 50).map((c, i) => `${i + 1}. "${c}"`).join('\n');
        const systemPrompt = 'You are an executive organizational development advisor. Synthesize the provided verbatim comments. ' +
            'You MUST return ONLY a JSON object strictly adhering to this schema:\n' +
            '{\n' +
            '  "strengths": ["string", "string", ...], // 2-4 key findings supported by comments\n' +
            '  "concerns": ["string", "string", ...],  // 2-4 critical themes with negative sentiment\n' +
            '  "recommendations": ["string", "string", ...] // 2-4 actionable organizational interventions\n' +
            '}\n' +
            'Ensure all points are grounded in the actual employee feedback provided.';
        const body = {
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: promptText },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 1200,
        };
        const response = await this.fetchWithRetry(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
        }
        const json = await response.json();
        const parsed = JSON.parse(json.choices?.[0]?.message?.content || '{}');
        return {
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        };
    }
    // =========================================================================
    // Google Gemini REST Endpoints
    // =========================================================================
    async callGeminiAnalyze(text, apiKey) {
        let model = this.clientAiConfig?.modelName;
        if (!model || model.startsWith('gpt') || model.startsWith('claude') || model === 'gemini-1.5-pro') {
            model = 'gemini-2.5-flash';
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = 'Analyze this employee survey comment: "' + text + '". ' +
            'Return ONLY a valid JSON object matching: ' +
            '{"sentimentScore": number (-1.0 to 1.0), "sentimentLabel": "POSITIVE"|"NEUTRAL"|"NEGATIVE", "confidence": number (0.0 to 1.0), "themes": ["string"]}';
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(candidateText);
        return {
            sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : 0,
            sentimentLabel: parsed.sentimentLabel || 'NEUTRAL',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
            themes: Array.isArray(parsed.themes) ? parsed.themes : ['General Workplace'],
        };
    }
    async callGeminiSummary(nodeId, comments, apiKey) {
        let model = this.clientAiConfig?.modelName;
        if (!model || model.startsWith('gpt') || model.startsWith('claude') || model === 'gemini-1.5-pro') {
            model = 'gemini-2.5-flash';
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = `Synthesize the following employee comments from department '${nodeId}':\n` +
            comments.slice(0, 50).map((c, i) => `${i + 1}. ${c}`).join('\n') +
            '\n\nReturn ONLY a JSON object matching:\n' +
            '{"strengths": ["string", ...], "concerns": ["string", ...], "recommendations": ["string", ...]}';
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(candidateText);
        return {
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        };
    }
    // =========================================================================
    // Robust HTTP Fetch with Timeout & Exponential Backoff for Rate Limits (429)
    // =========================================================================
    async fetchWithRetry(url, options, retries = 2, backoffMs = 500) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            if (response.status === 429 && retries > 0) {
                console.warn(`[AI-Analytics] Rate limit encountered (429) on ${url}. Retrying in ${backoffMs}ms...`);
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                return this.fetchWithRetry(url, options, retries - 1, backoffMs * 2);
            }
            return response;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    // =========================================================================
    // Dynamic Grounded Fallback (Synthesized from actual comments, no canned strings)
    // =========================================================================
    generateDynamicLocalSummary(nodeId, comments) {
        const positiveThemes = [];
        const negativeThemes = [];
        for (const c of comments) {
            const result = this.sentimentClassifier.classifyText(c);
            const themes = this.themeClustering.extractThemes(c);
            for (const t of themes) {
                if (result.sentimentLabel === 'POSITIVE' && !positiveThemes.includes(t)) {
                    positiveThemes.push(t);
                }
                else if (result.sentimentLabel === 'NEGATIVE' && !negativeThemes.includes(t)) {
                    negativeThemes.push(t);
                }
            }
        }
        const strengths = positiveThemes.length > 0
            ? positiveThemes.slice(0, 3).map((t) => `Positive employee sentiment and engagement noted regarding ${t.toLowerCase()} in unit ${nodeId}.`)
            : [`Overall consistent operational participation recorded across ${comments.length} respondent comments in unit ${nodeId}.`];
        const concerns = negativeThemes.length > 0
            ? negativeThemes.slice(0, 3).map((t) => `Feedback indicates friction and employee concern around ${t.toLowerCase()}.`)
            : ['No predominant systemic operational concerns reported in current submission sample.'];
        const recommendations = negativeThemes.length > 0
            ? negativeThemes.slice(0, 3).map((t) => `Formulate focused action initiatives to address employee feedback regarding ${t.toLowerCase()}.`)
            : [
                `Maintain positive communication rhythms established across unit ${nodeId}.`,
                'Review ongoing sentiment trajectories during quarterly organizational reviews.',
            ];
        return {
            strengths,
            concerns,
            recommendations,
            isAiSimulated: true,
        };
    }
}
exports.OpenAiGeminiAdapter = OpenAiGeminiAdapter;
//# sourceMappingURL=openai-gemini.adapter.js.map