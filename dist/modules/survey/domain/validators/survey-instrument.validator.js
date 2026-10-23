"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyInstrumentValidator = void 0;
class SurveyInstrumentValidator {
    static REQUIRED_LOCALES = ['en', 'si', 'ta'];
    static VALID_ARCHETYPES = [
        'ENGAGEMENT',
        'PULSE',
        'ONBOARDING',
        'EXIT',
        '360_FEEDBACK',
    ];
    static REQUIRED_360_GROUPS = ['SELF', 'MANAGER', 'PEER', 'DIRECT_REPORT'];
    validate(survey, options = {}) {
        const errors = [];
        const warnings = [];
        // 1. Validate Archetype
        if (options.archetype) {
            if (!SurveyInstrumentValidator.VALID_ARCHETYPES.includes(options.archetype)) {
                errors.push(`Invalid survey archetype '${options.archetype}'. Supported archetypes: ${SurveyInstrumentValidator.VALID_ARCHETYPES.join(', ')}`);
            }
        }
        // 2. Enforce Mandatory Translations (en, si, ta)
        const enforceTranslations = options.enforceTranslations ?? true;
        if (enforceTranslations) {
            this.validateTranslations(survey.title, 'Survey title', errors);
            if (!survey.pages || survey.pages.length === 0) {
                errors.push('Survey must contain at least one page.');
            }
            else {
                survey.pages.forEach((page, pageIdx) => {
                    if (!page.sections || page.sections.length === 0) {
                        errors.push(`Page '${page.pageId || pageIdx + 1}' must contain at least one section.`);
                    }
                    else {
                        page.sections.forEach((section, secIdx) => {
                            if (section.title) {
                                this.validateTranslations(section.title, `Section '${section.sectionId || secIdx + 1}' title`, errors);
                            }
                            else {
                                errors.push(`Section '${section.sectionId || secIdx + 1}' title is missing mandatory translations.`);
                            }
                        });
                    }
                });
            }
        }
        // 3. Enforce 11-point Standard Rating Scale (0-10) for eNPS Questions
        this.validateNpsQuestions(survey, errors);
        // 4. Detect and Prevent Cyclic Branching Logic Rules & Unreachable Targets
        this.validateBranchingLogic(survey, errors);
        // 5. Validate 360-degree Feedback Multi-Rater Groups
        if (options.archetype === '360_FEEDBACK') {
            this.validate360RaterGroups(options.raterGroups, errors);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    validateTranslations(textMap, fieldName, errors) {
        if (!textMap || typeof textMap !== 'object') {
            errors.push(`${fieldName} is missing mandatory translations (${SurveyInstrumentValidator.REQUIRED_LOCALES.join(', ')}).`);
            return;
        }
        for (const locale of SurveyInstrumentValidator.REQUIRED_LOCALES) {
            const val = textMap[locale];
            if (!val || typeof val !== 'string' || val.trim().length === 0) {
                errors.push(`${fieldName} is missing mandatory translation for locale '${locale}'.`);
            }
        }
    }
    validateNpsQuestions(survey, errors) {
        if (!survey.pages)
            return;
        for (const page of survey.pages) {
            if (!page.sections)
                continue;
            for (const section of page.sections) {
                if (!section.questions)
                    continue;
                for (const question of section.questions) {
                    const isNps = question.type === 'NPS' ||
                        (question.prompt &&
                            Object.values(question.prompt).some((p) => typeof p === 'string' && (/\beNPS\b/i.test(p) || /net promoter/i.test(p))));
                    if (isNps) {
                        if (question.options && question.options.length > 0) {
                            if (question.options.length !== 11) {
                                errors.push(`eNPS question '${question.questionId}' must define an 11-point standard scale (0 to 10). Found ${question.options.length} options.`);
                            }
                            else {
                                const scores = question.options.map((o) => o.scoreValue).filter((s) => s !== undefined);
                                if (scores.length === 11) {
                                    scores.sort((a, b) => a - b);
                                    const min = scores[0];
                                    const max = scores[10];
                                    if (min !== 0 || max !== 10) {
                                        errors.push(`eNPS question '${question.questionId}' score values must range from 0 (min) to 10 (max). Found range [${min}, ${max}].`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    validateBranchingLogic(survey, errors) {
        if (!survey.pages || survey.pages.length === 0)
            return;
        const pageIds = new Set(survey.pages.map((p) => p.pageId));
        const adjacencyList = new Map();
        // Initialize graph
        for (const page of survey.pages) {
            adjacencyList.set(page.pageId, new Set());
        }
        // Add sequential page flow: page i -> page i+1
        for (let i = 0; i < survey.pages.length - 1; i++) {
            adjacencyList.get(survey.pages[i].pageId).add(survey.pages[i + 1].pageId);
        }
        // Add branching edges from questions
        for (const page of survey.pages) {
            if (!page.sections)
                continue;
            for (const section of page.sections) {
                if (!section.questions)
                    continue;
                for (const q of section.questions) {
                    if (!q.logicRules)
                        continue;
                    for (const rule of q.logicRules) {
                        if (!pageIds.has(rule.targetPageId)) {
                            errors.push(`Branching rule in question '${q.questionId}' references non-existent target page '${rule.targetPageId}'.`);
                        }
                        else {
                            adjacencyList.get(page.pageId).add(rule.targetPageId);
                        }
                    }
                }
            }
        }
        // Cycle detection using standard 3-color DFS
        const visited = new Map(); // 0 = unvisited, 1 = visiting, 2 = visited
        for (const pageId of pageIds) {
            visited.set(pageId, 0);
        }
        const path = [];
        const hasCycle = (curr) => {
            visited.set(curr, 1);
            path.push(curr);
            const neighbors = adjacencyList.get(curr) || new Set();
            for (const next of neighbors) {
                if (visited.get(next) === 1) {
                    // Found cycle
                    const cycleStartIdx = path.indexOf(next);
                    const cyclePath = path.slice(cycleStartIdx).concat(next).join(' -> ');
                    errors.push(`Cyclic branching logic rule detected: ${cyclePath}`);
                    return true;
                }
                if (visited.get(next) === 0) {
                    if (hasCycle(next))
                        return true;
                }
            }
            path.pop();
            visited.set(curr, 2);
            return false;
        };
        for (const pageId of pageIds) {
            if (visited.get(pageId) === 0) {
                hasCycle(pageId);
            }
        }
    }
    validate360RaterGroups(raterGroups, errors) {
        if (!raterGroups || raterGroups.length === 0) {
            errors.push(`360-degree feedback instruments must configure multi-rater groups: ${SurveyInstrumentValidator.REQUIRED_360_GROUPS.join(', ')}.`);
            return;
        }
        const normalized = new Set(raterGroups.map((g) => g.toUpperCase().replace(/\s+/g, '_').trim()));
        const missing = [];
        for (const req of SurveyInstrumentValidator.REQUIRED_360_GROUPS) {
            if (!normalized.has(req)) {
                missing.push(req);
            }
        }
        if (missing.length > 0) {
            errors.push(`360-degree feedback instrument is missing required multi-rater groups: ${missing.join(', ')}.`);
        }
    }
}
exports.SurveyInstrumentValidator = SurveyInstrumentValidator;
//# sourceMappingURL=survey-instrument.validator.js.map