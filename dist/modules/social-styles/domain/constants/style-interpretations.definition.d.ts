import { SocialStyleType, SupportedSocialStyleLanguage } from './answer-key-v1.definition';
import { TranslationReviewStatus } from './questionnaire-v1.definition';
export type InterpretationContentStatus = 'DRAFT_PENDING_CONSULTANT_REVIEW' | 'APPROVED';
export interface StyleGuidanceContent {
    styleCode: SocialStyleType;
    styleName: string;
    axisSummary: string;
    overview: string;
    communicationPreferences: string[];
    workplaceStrengths: string[];
    potentialChallenges: string[];
    recommendationsForColleagues: string[];
    recommendationsForManagers: string[];
}
export interface LocalizedInterpretationBundle {
    language: SupportedSocialStyleLanguage;
    translationStatus: TranslationReviewStatus;
    disclaimer: string;
    fourAxisExplanation: string;
    netCoordinateExplanation: string;
    styles: Record<SocialStyleType, StyleGuidanceContent>;
}
export interface InterpretationTemplatesCatalog {
    version: string;
    contentStatus: InterpretationContentStatus;
    updatedAt: string;
    updatedBy: string;
    bundles: Record<SupportedSocialStyleLanguage, LocalizedInterpretationBundle>;
}
export declare const DEFAULT_INTERPRETATION_TEMPLATES_V1: InterpretationTemplatesCatalog;
export declare class SocialStyleInterpretationService {
    /**
     * Returns the localized interpretation bundle for a language, falling back to 'en' if needed.
     */
    static getLocalizedBundle(language?: SupportedSocialStyleLanguage, catalog?: InterpretationTemplatesCatalog): LocalizedInterpretationBundle;
    /**
     * Orders all four style guidance blocks from highest final score to lowest final score,
     * preserving canonical order ['DRIVER', 'EXPRESSIVE', 'AMIABLE', 'ANALYTICAL'] on ties.
     */
    static getOrderedStyleGuidance(finalScores: {
        analytical: number;
        amiable: number;
        expressive: number;
        driver: number;
    }, language?: SupportedSocialStyleLanguage, catalog?: InterpretationTemplatesCatalog): Array<StyleGuidanceContent & {
        finalScore: number;
        isHighestScored: boolean;
    }>;
}
