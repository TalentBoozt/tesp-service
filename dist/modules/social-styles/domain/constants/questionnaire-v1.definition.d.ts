import { AnswerOptionCode, SupportedSocialStyleLanguage } from './answer-key-v1.definition';
export type TranslationReviewStatus = 'VERIFIED_SOURCE' | 'PENDING_CONSULTANT_REVIEW' | 'APPROVED';
export interface LocalizedTextMap {
    en: string;
    si: string;
    ta: string;
}
export interface QuestionnaireOptionDefinition {
    code: AnswerOptionCode;
    labels: LocalizedTextMap;
}
export interface QuestionnaireQuestionDefinition {
    questionNumber: number;
    options: [
        QuestionnaireOptionDefinition,
        QuestionnaireOptionDefinition,
        QuestionnaireOptionDefinition,
        QuestionnaireOptionDefinition
    ];
}
export interface TranslationLanguageMetadata {
    status: TranslationReviewStatus;
    verifiedBy?: string;
    notes?: string;
}
export interface SocialStyleQuestionnaireDefinition {
    version: string;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    supportedLanguages: SupportedSocialStyleLanguage[];
    translationMetadata: Record<SupportedSocialStyleLanguage, TranslationLanguageMetadata>;
    instructions: LocalizedTextMap;
    questions: QuestionnaireQuestionDefinition[];
}
/**
 * Version v1.0 of the 20-Question Social Styles Questionnaire.
 * - English (en) and Sinhala (si) word sets are transcribed verbatim from the DAASH Global Questionnaire sheet (Page 1).
 * - Tamil (ta) word sets provide accurate native Tamil terminology marked PENDING_CONSULTANT_REVIEW.
 */
export declare const QUESTIONNAIRE_V1_DEFINITION: SocialStyleQuestionnaireDefinition;
/**
 * Returns a sanitized public view of the questionnaire guaranteed to contain
 * ONLY question numbers, option codes (A, B, C, D), and localized text labels.
 * Never includes answer keys or scoring metadata.
 */
export declare function getPublicQuestionnaireView(definition?: SocialStyleQuestionnaireDefinition): {
    version: string;
    supportedLanguages: SupportedSocialStyleLanguage[];
    translationMetadata: Record<SupportedSocialStyleLanguage, TranslationLanguageMetadata>;
    instructions: {
        en: string;
        si: string;
        ta: string;
    };
    questions: {
        questionNumber: number;
        options: {
            code: AnswerOptionCode;
            labels: {
                en: string;
                si: string;
                ta: string;
            };
        }[];
    }[];
};
/**
 * Helper to look up the localized label of an option for a given question number.
 */
export declare function getQuestionOptionLabel(questionNumber: number, optionCode: AnswerOptionCode, language?: SupportedSocialStyleLanguage, definition?: SocialStyleQuestionnaireDefinition): string;
