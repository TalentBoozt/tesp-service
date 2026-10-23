"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentAnalyzerService = void 0;
/**
 * Resilient, local rule-based Sentiment Analyzer using a weighted
 * valence dictionary (AFINN/VADER style) requiring zero external API keys.
 */
class SentimentAnalyzerService {
    // Weighted token dictionary: [-3.0 to +3.0]
    static VALENCE_DICT = {
        // Highly Positive (+3)
        excellent: 3.0,
        outstanding: 3.0,
        exceptional: 3.0,
        fantastic: 3.0,
        amazing: 3.0,
        inspiring: 3.0,
        visionary: 3.0,
        love: 3.0,
        perfect: 3.0,
        brilliant: 3.0,
        // Moderately Positive (+2)
        great: 2.0,
        supportive: 2.0,
        transparent: 2.0,
        collaborative: 2.0,
        rewarding: 2.0,
        empowering: 2.0,
        flexible: 2.0,
        satisfied: 2.0,
        happy: 2.0,
        appreciate: 2.0,
        appreciated: 2.0,
        helpful: 2.0,
        respectful: 2.0,
        growth: 2.0,
        thriving: 2.0,
        innovative: 2.0,
        trust: 2.0,
        trusted: 2.0,
        // Mildly Positive (+1)
        good: 1.0,
        fine: 1.0,
        decent: 1.0,
        clear: 1.0,
        fair: 1.0,
        pleasant: 1.0,
        safe: 1.0,
        steady: 1.0,
        constructive: 1.0,
        // Mildly Negative (-1)
        slow: -1.0,
        friction: -1.0,
        confusing: -1.0,
        unclear: -1.0,
        delay: -1.0,
        delayed: -1.0,
        busy: -1.0,
        tiring: -1.0,
        boring: -1.0,
        // Moderately Negative (-2)
        poor: -2.0,
        bad: -2.0,
        frustrated: -2.0,
        frustrating: -2.0,
        burnout: -2.0,
        overworked: -2.0,
        stress: -2.0,
        stressful: -2.0,
        unfair: -2.0,
        disappointed: -2.0,
        disappointing: -2.0,
        fatigue: -2.0,
        broken: -2.0,
        overtime: -2.0,
        micromanage: -2.0,
        micromanaged: -2.0,
        // Highly Negative (-3)
        terrible: -3.0,
        awful: -3.0,
        toxic: -3.0,
        harassment: -3.0,
        hostile: -3.0,
        danger: -3.0,
        dangerous: -3.0,
        hazard: -3.0,
        retaliation: -3.0,
        abusive: -3.0,
        unsafe: -3.0,
        corrupt: -3.0,
    };
    // Intensifiers multiply following token valence
    static INTENSIFIERS = {
        very: 1.4,
        extremely: 1.6,
        highly: 1.5,
        really: 1.3,
        completely: 1.4,
        absolutely: 1.5,
        super: 1.3,
        incredibly: 1.5,
    };
    // Negators invert following token valence
    static NEGATORS = new Set([
        'not',
        "don't",
        'dont',
        "didn't",
        'didnt',
        "isn't",
        'isnt',
        "aren't",
        'arent',
        'never',
        'hardly',
        'barely',
        'without',
        'no',
    ]);
    analyze(text) {
        if (!text || text.trim().length === 0) {
            return {
                sentimentScore: 0.0,
                sentimentLabel: 'NEUTRAL',
                confidence: 0.5,
                matchedTokens: [],
            };
        }
        const words = text
            .toLowerCase()
            .replace(/[^\w\s'-]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 0);
        let totalValence = 0;
        let tokenCount = 0;
        const matchedTokens = [];
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let weight = SentimentAnalyzerService.VALENCE_DICT[word];
            if (weight !== undefined) {
                // Look back up to 2 tokens for negators or intensifiers
                let modifier = 1.0;
                let isNegated = false;
                for (let j = Math.max(0, i - 2); j < i; j++) {
                    const prevWord = words[j];
                    if (SentimentAnalyzerService.NEGATORS.has(prevWord)) {
                        isNegated = true;
                    }
                    if (SentimentAnalyzerService.INTENSIFIERS[prevWord]) {
                        modifier *= SentimentAnalyzerService.INTENSIFIERS[prevWord];
                    }
                }
                if (isNegated) {
                    weight = -weight * 0.8;
                }
                else {
                    weight = weight * modifier;
                }
                matchedTokens.push({ token: word, weight: Math.round(weight * 100) / 100 });
                totalValence += weight;
                tokenCount++;
            }
        }
        if (tokenCount === 0) {
            return {
                sentimentScore: 0.0,
                sentimentLabel: 'NEUTRAL',
                confidence: 0.7,
                matchedTokens: [],
            };
        }
        // Normalize raw score to range [-1.0, 1.0] using hyperbolic tangent or bounded scaling
        const normalizedScore = Math.max(-1.0, Math.min(1.0, Math.round((totalValence / Math.sqrt(totalValence * totalValence + 15)) * 100) / 100));
        let sentimentLabel = 'NEUTRAL';
        if (normalizedScore >= 0.2) {
            sentimentLabel = 'POSITIVE';
        }
        else if (normalizedScore <= -0.2) {
            sentimentLabel = 'NEGATIVE';
        }
        // Confidence scales with number of matched tokens
        const confidence = Math.min(1.0, Math.round((0.7 + tokenCount * 0.05) * 100) / 100);
        return {
            sentimentScore: normalizedScore,
            sentimentLabel,
            confidence,
            matchedTokens,
        };
    }
}
exports.SentimentAnalyzerService = SentimentAnalyzerService;
//# sourceMappingURL=sentiment-analyzer.service.js.map