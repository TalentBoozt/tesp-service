import { AnswerKeyRow, AnswerOptionCode, SocialStyleType } from '../constants/answer-key-v1.definition';
export interface SubmittedAnswerInput {
    questionNumber: number;
    selectedOption: string;
}
export interface AnswerBreakdownItem {
    questionNumber: number;
    selectedOption: AnswerOptionCode;
    mappedStyle: SocialStyleType;
}
export interface SocialStyleRawScores {
    analytical: number;
    amiable: number;
    expressive: number;
    driver: number;
    total: number;
}
export interface SocialStyleFinalScores {
    analytical: number;
    amiable: number;
    expressive: number;
    driver: number;
    total: number;
}
export interface SocialStyleScoringOutput {
    scoringVersion: string;
    rawScores: SocialStyleRawScores;
    finalScores: SocialStyleFinalScores;
    highestScoredStyles: SocialStyleType[];
    answerBreakdown: AnswerBreakdownItem[];
}
export declare class SocialStyleScoringValidationError extends Error {
    readonly code = "INVALID_ASSESSMENT_ANSWERS";
    readonly errors: string[];
    constructor(message: string, errors?: string[]);
}
/**
 * Pure, deterministic domain service implementing the exact DAASH Global Social Styles scoring specification.
 * Zero dependency on Express, Mongoose, or frontend modules.
 */
export declare class SocialStyleScoringService {
    static readonly EXPECTED_QUESTION_COUNT = 20;
    static readonly RAW_TO_FINAL_MULTIPLIER = 5;
    static readonly EXPECTED_RAW_TOTAL = 20;
    static readonly EXPECTED_FINAL_TOTAL = 100;
    /**
     * Validates and scores a 20-question assessment submission.
     */
    calculateScores(answers: SubmittedAnswerInput[], customAnswerKey?: readonly AnswerKeyRow[], scoringVersion?: string): SocialStyleScoringOutput;
    /**
     * Validates that exactly 20 unique questions (1..20) are answered with valid options (A|B|C|D).
     */
    validateAndNormalizeAnswers(answers: SubmittedAnswerInput[]): Array<{
        questionNumber: number;
        selectedOption: AnswerOptionCode;
    }>;
    private buildLookupMap;
    private assertScoreInvariants;
    /**
     * Returns the authoritative v1.0 answer key rows (for internal seeding/testing).
     */
    getAnswerKeyV1(): readonly AnswerKeyRow[];
}
