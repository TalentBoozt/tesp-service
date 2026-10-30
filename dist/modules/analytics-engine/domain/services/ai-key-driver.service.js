"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiKeyDriverService = void 0;
class AiKeyDriverService {
    formatThemeName(groupId) {
        const clean = groupId.replace(/^GRP-/, '').toLowerCase().replace(/-/g, '_');
        const labelMap = {
            leadership: 'Leadership & Vision',
            leadership_trust: 'Leadership & Vision Trust',
            leadership_management: 'Leadership & Management',
            culture: 'Workplace Culture',
            culture_values: 'Company Culture & Values',
            workplace_culture: 'Workplace Inclusion & Safety',
            growth: 'Career Growth',
            growth_learning: 'Career Growth & Development',
            career_development: 'Learning & Career Development',
            manager: 'Manager Support',
            manager_support: 'Managerial Effectiveness & Coaching',
            safety: 'Psychological Safety',
            psychological_safety: 'Psychological Safety & Openness',
            compensation: 'Compensation & Recognition',
            compensation_fairness: 'Compensation & Recognition',
            communication: 'Communication & Teamwork',
            communication_teamwork: 'Communication & Teamwork',
            wellbeing: 'Employee Well-being & Inclusion',
            wellbeing_inclusion: 'Employee Well-being & Inclusion',
            workplace_satisfaction: 'Workplace Satisfaction',
            satisfaction: 'Workplace Satisfaction',
            overall_engagement: 'Overall Employee Engagement',
            enps: 'Employee Net Promoter Score (eNPS)',
        };
        return (labelMap[clean] ||
            labelMap[clean.replace(/s$/, '')] ||
            groupId
                .replace(/^GRP-/, '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()));
    }
    /**
     * Calculates the bivariate Pearson correlation coefficient r between paired numeric values:
     * r = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \sum (y - \bar{y})^2}}
     * Returns a value between -1.0 and 1.0, or 0 if sample size < 2 or variance is zero.
     */
    calculateCorrelationWeights(pairs) {
        return this.calculatePearsonCorrelation(pairs);
    }
    calculatePearsonCorrelation(pairs) {
        const N = pairs.length;
        if (N < 2)
            return 0;
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < N; i++) {
            sumX += pairs[i].x;
            sumY += pairs[i].y;
        }
        const meanX = sumX / N;
        const meanY = sumY / N;
        let cov = 0;
        let varX = 0;
        let varY = 0;
        for (let i = 0; i < N; i++) {
            const diffX = pairs[i].x - meanX;
            const diffY = pairs[i].y - meanY;
            cov += diffX * diffY;
            varX += diffX * diffX;
            varY += diffY * diffY;
        }
        // Zero variance guard: when all scores are constant, gracefully return 0 without NaN
        if (varX <= 1e-12 || varY <= 1e-12) {
            return 0;
        }
        const denominator = Math.sqrt(varX * varY);
        if (denominator <= 1e-12 || isNaN(denominator)) {
            return 0;
        }
        const r = cov / denominator;
        if (isNaN(r) || !isFinite(r)) {
            return 0;
        }
        // Clamp to valid correlation bounds [-1.0, 1.0]
        return Math.max(-1.0, Math.min(1.0, r));
    }
    normalizePercentages(rawWeights) {
        const totalWeight = rawWeights.reduce((acc, w) => acc + Math.max(0, w), 0);
        if (totalWeight <= 0) {
            return rawWeights.map(() => 0);
        }
        const exactPercentages = rawWeights.map((w) => (Math.max(0, w) / totalWeight) * 100);
        const floors = exactPercentages.map((p) => Math.floor(p));
        const remainders = exactPercentages.map((p, idx) => ({ remainder: p - floors[idx], idx }));
        const currentSum = floors.reduce((a, b) => a + b, 0);
        const diff = 100 - currentSum;
        remainders.sort((a, b) => b.remainder - a.remainder);
        for (let i = 0; i < diff; i++) {
            floors[remainders[i].idx]++;
        }
        return floors;
    }
    analyzeKeyDrivers(inputData, specifiedDimensions) {
        if (!inputData || !Array.isArray(inputData) || inputData.length === 0) {
            return [];
        }
        // Support legacy aggregate group score input: [{ groupId: string; score: number }]
        const isGroupAggregate = inputData.every((item) => item && typeof item.groupId === 'string' && typeof item.score === 'number' && item.overallScore === undefined);
        if (isGroupAggregate) {
            const rawScores = inputData.map((g) => Math.max(0, g.score || 0));
            const impactPercentages = this.normalizePercentages(rawScores);
            const sum = rawScores.reduce((a, b) => a + b, 0);
            return inputData
                .map((g, idx) => {
                const weight = sum > 0 ? Number((Math.max(0, g.score) / sum).toFixed(4)) : 0;
                return {
                    groupId: g.groupId,
                    themeName: this.formatThemeName(g.groupId),
                    correlationWeight: Math.round(weight * 100) / 100,
                    impactPercentage: impactPercentages[idx],
                };
            })
                .sort((a, b) => b.correlationWeight - a.correlationWeight);
        }
        // Respondent-level statistical evaluation
        let dimKeys = specifiedDimensions ? [...specifiedDimensions] : [];
        if (dimKeys.length === 0) {
            const detected = new Set();
            for (const row of inputData) {
                if (row.dimensionScores && typeof row.dimensionScores === 'object') {
                    Object.keys(row.dimensionScores).forEach((k) => detected.add(k));
                }
                else if (row.dimensions && typeof row.dimensions === 'object') {
                    Object.keys(row.dimensions).forEach((k) => detected.add(k));
                }
                else if (Array.isArray(row.answers)) {
                    for (const ans of row.answers) {
                        const g = ans.groupId || ans.category;
                        if (g && typeof g === 'string') {
                            detected.add(g.toLowerCase());
                        }
                        else if (ans.questionId) {
                            const qId = ans.questionId.toLowerCase();
                            if (qId.startsWith('grp-')) {
                                const parts = qId.split('-');
                                detected.add(parts[1] || qId);
                            }
                            else if (qId.startsWith('q-')) {
                                const parts = qId.split('-');
                                const prefix = parts[1] || '';
                                const prefixMap = {
                                    sat: 'workplace_satisfaction',
                                    cul: 'culture_values',
                                    ldr: 'leadership_management',
                                    com: 'communication_teamwork',
                                    dev: 'career_development',
                                    wel: 'wellbeing_inclusion',
                                    eng: 'overall_engagement',
                                };
                                if (prefixMap[prefix]) {
                                    detected.add(prefixMap[prefix]);
                                }
                                else if (prefix !== 'dem' && prefix !== 'opn') {
                                    detected.add(prefix);
                                }
                            }
                            else {
                                detected.add(ans.questionId);
                            }
                        }
                    }
                }
                else {
                    const excludedKeys = new Set([
                        'overallscore', 'overall', 'score', 'enps', 'engagementindex', 'y',
                        'responseid', 'respondentid', 'id', 'nodeid', 'projectid', 'campaignid',
                        'surveyid', 'surveyversion', 'respondenttype', 'submittedat',
                        'demographicsnapshot', 'answers', 'isdeleted', 'createdat', 'updatedat'
                    ]);
                    Object.keys(row).forEach((k) => {
                        if (!excludedKeys.has(k.toLowerCase()) && typeof row[k] === 'number') {
                            detected.add(k);
                        }
                    });
                }
            }
            dimKeys = Array.from(detected);
        }
        if (dimKeys.length === 0) {
            return [];
        }
        const results = [];
        for (const dim of dimKeys) {
            const pairs = [];
            for (const row of inputData) {
                let y;
                if (typeof row.overallScore === 'number')
                    y = row.overallScore;
                else if (typeof row.overall === 'number')
                    y = row.overall;
                else if (typeof row.engagementIndex === 'number')
                    y = row.engagementIndex;
                else if (typeof row.enps === 'number')
                    y = row.enps;
                else if (typeof row.score === 'number')
                    y = row.score;
                else if (typeof row.y === 'number')
                    y = row.y;
                else if (Array.isArray(row.answers)) {
                    const nums = row.answers
                        .map((a) => a.numericValue)
                        .filter((v) => typeof v === 'number' && !isNaN(v));
                    if (nums.length > 0) {
                        y = nums.reduce((a, b) => a + b, 0) / nums.length;
                    }
                }
                let x;
                if (row.dimensionScores && typeof row.dimensionScores[dim] === 'number') {
                    x = row.dimensionScores[dim];
                }
                else if (row.dimensions && typeof row.dimensions[dim] === 'number') {
                    x = row.dimensions[dim];
                }
                else if (typeof row[dim] === 'number') {
                    x = row[dim];
                }
                else if (Array.isArray(row.answers)) {
                    const matchingAnswers = row.answers
                        .filter((a) => {
                        const qId = (a.questionId || '').toLowerCase();
                        const groupId = (a.groupId || a.category || '').toLowerCase();
                        const dimLower = dim.toLowerCase();
                        if (groupId && (groupId === dimLower || groupId.includes(dimLower) || dimLower.includes(groupId)))
                            return true;
                        if (qId.includes(dimLower))
                            return true;
                        if (dimLower === 'workplace_satisfaction' && qId.includes('-sat-'))
                            return true;
                        if (dimLower === 'culture_values' && qId.includes('-cul-'))
                            return true;
                        if (dimLower === 'leadership_management' && qId.includes('-ldr-'))
                            return true;
                        if (dimLower === 'communication_teamwork' && qId.includes('-com-'))
                            return true;
                        if (dimLower === 'career_development' && qId.includes('-dev-'))
                            return true;
                        if (dimLower === 'wellbeing_inclusion' && qId.includes('-wel-'))
                            return true;
                        if (dimLower === 'overall_engagement' && qId.includes('-eng-'))
                            return true;
                        return false;
                    })
                        .map((a) => a.numericValue)
                        .filter((v) => typeof v === 'number' && !isNaN(v));
                    if (matchingAnswers.length > 0) {
                        x = matchingAnswers.reduce((a, b) => a + b, 0) / matchingAnswers.length;
                    }
                }
                if (x !== undefined && y !== undefined && !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
                    pairs.push({ x, y });
                }
            }
            const r = this.calculatePearsonCorrelation(pairs);
            results.push({
                groupId: dim,
                themeName: this.formatThemeName(dim),
                r,
            });
        }
        // Standardized regression coefficient & normalized relative importance weights
        const rawWeights = results.map((res) => Math.max(0, res.r));
        const impactPercentages = this.normalizePercentages(rawWeights);
        const keyDrivers = results.map((res, idx) => ({
            groupId: res.groupId,
            themeName: res.themeName,
            correlationWeight: Math.round(res.r * 100) / 100,
            impactPercentage: impactPercentages[idx],
        }));
        return keyDrivers.sort((a, b) => b.correlationWeight - a.correlationWeight || b.impactPercentage - a.impactPercentage);
    }
    detectAnomalies(currentScores, baselineScores) {
        const alerts = [];
        for (const curr of currentScores) {
            const baseline = baselineScores.get(curr.nodeId);
            if (baseline !== undefined && baseline > 0) {
                const drop = Math.round(((baseline - curr.score) / baseline) * 1000) / 10;
                if (drop >= 10.0) {
                    alerts.push({
                        nodeId: curr.nodeId,
                        baselineScore: baseline,
                        currentScore: curr.score,
                        dropPercentage: drop,
                        alertLevel: drop >= 15.0 ? 'HIGH' : 'MEDIUM',
                    });
                }
            }
        }
        return alerts;
    }
}
exports.AiKeyDriverService = AiKeyDriverService;
//# sourceMappingURL=ai-key-driver.service.js.map