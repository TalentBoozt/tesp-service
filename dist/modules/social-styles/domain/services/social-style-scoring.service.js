"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStyleScoringService = exports.SocialStyleScoringValidationError = void 0;
const answer_key_v1_definition_1 = require("../constants/answer-key-v1.definition");
class SocialStyleScoringValidationError extends Error {
    code = 'INVALID_ASSESSMENT_ANSWERS';
    errors;
    constructor(message, errors = [message]) {
        super(message);
        this.name = 'SocialStyleScoringValidationError';
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.SocialStyleScoringValidationError = SocialStyleScoringValidationError;
/**
 * Pure, deterministic domain service implementing the exact DAASH Global Social Styles scoring specification.
 * Zero dependency on Express, Mongoose, or frontend modules.
 */
class SocialStyleScoringService {
    static EXPECTED_QUESTION_COUNT = 20;
    static RAW_TO_FINAL_MULTIPLIER = 5;
    static EXPECTED_RAW_TOTAL = 20;
    static EXPECTED_FINAL_TOTAL = 100;
    /**
     * Validates and scores a 20-question assessment submission.
     */
    calculateScores(answers, customAnswerKey, scoringVersion = answer_key_v1_definition_1.CURRENT_SCORING_VERSION) {
        const normalizedAnswers = this.validateAndNormalizeAnswers(answers);
        const lookupMap = customAnswerKey
            ? this.buildLookupMap(customAnswerKey)
            : answer_key_v1_definition_1.QUESTION_OPTION_TO_STYLE_V1;
        const rawCounts = {
            ANALYTICAL: 0,
            AMIABLE: 0,
            EXPRESSIVE: 0,
            DRIVER: 0,
        };
        const answerBreakdown = [];
        for (const item of normalizedAnswers) {
            const questionMapping = lookupMap[item.questionNumber];
            if (!questionMapping) {
                throw new SocialStyleScoringValidationError(`Answer key mapping missing for question ${item.questionNumber}`);
            }
            const mappedStyle = questionMapping[item.selectedOption];
            if (!mappedStyle) {
                throw new SocialStyleScoringValidationError(`Invalid option '${item.selectedOption}' for question ${item.questionNumber}`);
            }
            rawCounts[mappedStyle] += 1;
            answerBreakdown.push({
                questionNumber: item.questionNumber,
                selectedOption: item.selectedOption,
                mappedStyle,
            });
        }
        const rawScores = {
            analytical: rawCounts.ANALYTICAL,
            amiable: rawCounts.AMIABLE,
            expressive: rawCounts.EXPRESSIVE,
            driver: rawCounts.DRIVER,
            total: rawCounts.ANALYTICAL +
                rawCounts.AMIABLE +
                rawCounts.EXPRESSIVE +
                rawCounts.DRIVER,
        };
        const finalScores = {
            analytical: rawScores.analytical * SocialStyleScoringService.RAW_TO_FINAL_MULTIPLIER,
            amiable: rawScores.amiable * SocialStyleScoringService.RAW_TO_FINAL_MULTIPLIER,
            expressive: rawScores.expressive * SocialStyleScoringService.RAW_TO_FINAL_MULTIPLIER,
            driver: rawScores.driver * SocialStyleScoringService.RAW_TO_FINAL_MULTIPLIER,
            total: 0,
        };
        finalScores.total =
            finalScores.analytical +
                finalScores.amiable +
                finalScores.expressive +
                finalScores.driver;
        // Enforce mathematical invariants
        this.assertScoreInvariants(rawScores, finalScores);
        const maxFinalScore = Math.max(finalScores.analytical, finalScores.amiable, finalScores.expressive, finalScores.driver);
        const highestScoredStyles = [];
        if (finalScores.analytical === maxFinalScore)
            highestScoredStyles.push('ANALYTICAL');
        if (finalScores.amiable === maxFinalScore)
            highestScoredStyles.push('AMIABLE');
        if (finalScores.expressive === maxFinalScore)
            highestScoredStyles.push('EXPRESSIVE');
        if (finalScores.driver === maxFinalScore)
            highestScoredStyles.push('DRIVER');
        return {
            scoringVersion,
            rawScores,
            finalScores,
            highestScoredStyles,
            answerBreakdown,
        };
    }
    /**
     * Validates that exactly 20 unique questions (1..20) are answered with valid options (A|B|C|D).
     */
    validateAndNormalizeAnswers(answers) {
        if (!Array.isArray(answers)) {
            throw new SocialStyleScoringValidationError('Answers payload must be an array of 20 items.');
        }
        const errors = [];
        if (answers.length !== SocialStyleScoringService.EXPECTED_QUESTION_COUNT) {
            errors.push(`Expected exactly ${SocialStyleScoringService.EXPECTED_QUESTION_COUNT} answers, but received ${answers.length}.`);
        }
        const seenQuestions = new Set();
        const normalized = [];
        for (let i = 0; i < answers.length; i++) {
            const entry = answers[i];
            if (!entry || typeof entry !== 'object') {
                errors.push(`Answer at index ${i} is not a valid object.`);
                continue;
            }
            const qNum = Number(entry.questionNumber);
            if (!Number.isInteger(qNum) ||
                qNum < 1 ||
                qNum > SocialStyleScoringService.EXPECTED_QUESTION_COUNT) {
                errors.push(`Invalid questionNumber '${entry.questionNumber}' at index ${i}. Must be an integer between 1 and 20.`);
                continue;
            }
            if (seenQuestions.has(qNum)) {
                errors.push(`Duplicate answer detected for question ${qNum}.`);
                continue;
            }
            seenQuestions.add(qNum);
            const rawOption = typeof entry.selectedOption === 'string' ? entry.selectedOption.trim().toUpperCase() : '';
            if (!answer_key_v1_definition_1.VALID_ANSWER_OPTIONS.includes(rawOption)) {
                errors.push(`Invalid selectedOption '${entry.selectedOption}' for question ${qNum}. Allowed options are A, B, C, D.`);
                continue;
            }
            normalized.push({
                questionNumber: qNum,
                selectedOption: rawOption,
            });
        }
        // Check for any missing questions 1..20
        const missingQuestions = [];
        for (let q = 1; q <= SocialStyleScoringService.EXPECTED_QUESTION_COUNT; q++) {
            if (!seenQuestions.has(q)) {
                missingQuestions.push(q);
            }
        }
        if (missingQuestions.length > 0) {
            errors.push(`Missing answers for question(s): ${missingQuestions.join(', ')}.`);
        }
        if (errors.length > 0) {
            throw new SocialStyleScoringValidationError(errors[0], errors);
        }
        return normalized.sort((a, b) => a.questionNumber - b.questionNumber);
    }
    buildLookupMap(rows) {
        if (!Array.isArray(rows) || rows.length !== SocialStyleScoringService.EXPECTED_QUESTION_COUNT) {
            throw new SocialStyleScoringValidationError('Custom answer key must contain exactly 20 rows.');
        }
        const map = {};
        for (const row of rows) {
            const optionsSet = new Set([row.analytical, row.amiable, row.expressive, row.driver]);
            if (optionsSet.size !== 4) {
                throw new SocialStyleScoringValidationError(`Answer key row for question ${row.questionNumber} does not map A, B, C, D bijectively.`);
            }
            map[row.questionNumber] = {
                [row.analytical]: 'ANALYTICAL',
                [row.amiable]: 'AMIABLE',
                [row.expressive]: 'EXPRESSIVE',
                [row.driver]: 'DRIVER',
            };
        }
        return map;
    }
    assertScoreInvariants(rawScores, finalScores) {
        if (rawScores.total !== SocialStyleScoringService.EXPECTED_RAW_TOTAL) {
            throw new SocialStyleScoringValidationError(`Scoring invariant violation: Raw score total must equal 20, got ${rawScores.total}.`);
        }
        const styles = [
            'analytical',
            'amiable',
            'expressive',
            'driver',
        ];
        for (const style of styles) {
            const rawVal = rawScores[style];
            const finalVal = finalScores[style];
            if (rawVal < 0 || rawVal > 20 || !Number.isInteger(rawVal)) {
                throw new SocialStyleScoringValidationError(`Scoring invariant violation: Raw score for ${style} out of bounds (${rawVal}).`);
            }
            if (finalVal < 0 || finalVal > 100 || finalVal % 5 !== 0) {
                throw new SocialStyleScoringValidationError(`Scoring invariant violation: Final score for ${style} (${finalVal}) must be between 0 and 100 and divisible by 5.`);
            }
        }
        if (finalScores.total !== SocialStyleScoringService.EXPECTED_FINAL_TOTAL) {
            throw new SocialStyleScoringValidationError(`Scoring invariant violation: Final score total must equal 100, got ${finalScores.total}.`);
        }
    }
    /**
     * Returns the authoritative v1.0 answer key rows (for internal seeding/testing).
     */
    getAnswerKeyV1() {
        return answer_key_v1_definition_1.ANSWER_KEY_V1_ROWS;
    }
}
exports.SocialStyleScoringService = SocialStyleScoringService;
//# sourceMappingURL=social-style-scoring.service.js.map