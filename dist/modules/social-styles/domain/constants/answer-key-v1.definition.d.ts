/**
 * Authoritative DAASH Global Social Styles Answer Key (Version v1.0)
 * Strictly internal to the scoring domain. Must NEVER be exposed on public respondent endpoints.
 */
export type SocialStyleType = 'ANALYTICAL' | 'AMIABLE' | 'EXPRESSIVE' | 'DRIVER';
export type AnswerOptionCode = 'A' | 'B' | 'C' | 'D';
export type SupportedSocialStyleLanguage = 'en' | 'si' | 'ta';
export interface AnswerKeyRow {
    questionNumber: number;
    analytical: AnswerOptionCode;
    amiable: AnswerOptionCode;
    expressive: AnswerOptionCode;
    driver: AnswerOptionCode;
}
export declare const SOCIAL_STYLE_TYPES: readonly SocialStyleType[];
export declare const VALID_ANSWER_OPTIONS: readonly AnswerOptionCode[];
export declare const CURRENT_SCORING_VERSION = "v1.0";
export declare const CURRENT_QUESTIONNAIRE_VERSION = "v1.0";
export declare const CURRENT_GRAPH_VERSION = "v1.0-option-a";
export declare const CURRENT_INTERPRETATION_VERSION = "v1.0";
/**
 * Exact 20-question mapping from the DAASH Global Social Styles Answer Sheet (Page 2).
 * Each row maps the option letter (A, B, C, D) that awards 1 raw point to the respective style.
 */
export declare const ANSWER_KEY_V1_ROWS: readonly AnswerKeyRow[];
/**
 * Direct O(1) lookup table: QUESTION_OPTION_TO_STYLE_V1[questionNumber][optionCode] -> SocialStyleType
 */
export declare const QUESTION_OPTION_TO_STYLE_V1: Readonly<Record<number, Readonly<Record<AnswerOptionCode, SocialStyleType>>>>;
