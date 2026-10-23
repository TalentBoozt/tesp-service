import { ISurveyProps } from '../entities/survey.entity';
export type SurveyArchetype = 'ENGAGEMENT' | 'PULSE' | 'ONBOARDING' | 'EXIT' | '360_FEEDBACK';
export interface SurveyValidationOptions {
    archetype?: SurveyArchetype;
    raterGroups?: string[];
    enforceTranslations?: boolean;
}
export interface SurveyValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class SurveyInstrumentValidator {
    static readonly REQUIRED_LOCALES: readonly ["en", "si", "ta"];
    static readonly VALID_ARCHETYPES: SurveyArchetype[];
    static readonly REQUIRED_360_GROUPS: string[];
    validate(survey: ISurveyProps, options?: SurveyValidationOptions): SurveyValidationResult;
    private validateTranslations;
    private validateNpsQuestions;
    private validateBranchingLogic;
    private validate360RaterGroups;
}
