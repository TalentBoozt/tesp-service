import { z } from 'zod';
export declare const SupportedLanguageEnum: z.ZodEnum<["en", "si", "ta"]>;
export declare const AnswerOptionEnum: z.ZodEnum<["A", "B", "C", "D"]>;
export declare const CreateAssessmentSchema: z.ZodObject<{
    participantName: z.ZodString;
    participantEmail: z.ZodString;
    participantPhone: z.ZodOptional<z.ZodString>;
    organizationName: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    participantId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
    consultantNotes: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodEnum<["en", "si", "ta"]>>;
    tokenExpiresAt: z.ZodOptional<z.ZodString>;
    generatePublicLinkNow: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    participantName: string;
    participantEmail: string;
    language: "en" | "si" | "ta";
    generatePublicLinkNow: boolean;
    organizationId?: string | undefined;
    title?: string | undefined;
    organizationName?: string | undefined;
    consultantNotes?: string | undefined;
    tokenExpiresAt?: string | undefined;
    participantId?: string | undefined;
    participantPhone?: string | undefined;
    reference?: string | undefined;
}, {
    participantName: string;
    participantEmail: string;
    organizationId?: string | undefined;
    title?: string | undefined;
    organizationName?: string | undefined;
    consultantNotes?: string | undefined;
    tokenExpiresAt?: string | undefined;
    participantId?: string | undefined;
    participantPhone?: string | undefined;
    reference?: string | undefined;
    language?: "en" | "si" | "ta" | undefined;
    generatePublicLinkNow?: boolean | undefined;
}>;
export declare const UpdateAssessmentSchema: z.ZodObject<{
    participantName: z.ZodOptional<z.ZodString>;
    participantEmail: z.ZodOptional<z.ZodString>;
    participantPhone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    organizationName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    consultantNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    language: z.ZodOptional<z.ZodEnum<["en", "si", "ta"]>>;
    tokenExpiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    organizationName?: string | null | undefined;
    consultantNotes?: string | null | undefined;
    tokenExpiresAt?: string | null | undefined;
    participantName?: string | undefined;
    participantEmail?: string | undefined;
    participantPhone?: string | null | undefined;
    reference?: string | null | undefined;
    language?: "en" | "si" | "ta" | undefined;
}, {
    title?: string | undefined;
    organizationName?: string | null | undefined;
    consultantNotes?: string | null | undefined;
    tokenExpiresAt?: string | null | undefined;
    participantName?: string | undefined;
    participantEmail?: string | undefined;
    participantPhone?: string | null | undefined;
    reference?: string | null | undefined;
    language?: "en" | "si" | "ta" | undefined;
}>;
export declare const GenerateLinkSchema: z.ZodObject<{
    tokenExpiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tokenExpiresAt?: string | undefined;
}, {
    tokenExpiresAt?: string | undefined;
}>;
export declare const ReopenAssessmentSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    tokenExpiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
    tokenExpiresAt?: string | undefined;
}, {
    reason?: string | undefined;
    tokenExpiresAt?: string | undefined;
}>;
export declare const ListAssessmentsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["ALL", "DRAFT", "INVITED", "IN_PROGRESS", "COMPLETED", "REVIEWED", "EXPIRED", "REVOKED", "CANCELLED", "REOPENED"]>>;
    exportedFilter: z.ZodDefault<z.ZodEnum<["ALL", "EXPORTED", "NOT_EXPORTED"]>>;
    language: z.ZodDefault<z.ZodEnum<["ALL", "en", "si", "ta"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "completedAt", "participantName", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    consultantId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "ALL" | "IN_PROGRESS" | "REVOKED" | "REVIEWED" | "INVITED" | "REOPENED";
    limit: number;
    page: number;
    language: "ALL" | "en" | "si" | "ta";
    exportedFilter: "ALL" | "EXPORTED" | "NOT_EXPORTED";
    sortBy: "status" | "createdAt" | "completedAt" | "participantName";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    consultantId?: string | undefined;
}, {
    status?: "DRAFT" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "ALL" | "IN_PROGRESS" | "REVOKED" | "REVIEWED" | "INVITED" | "REOPENED" | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    consultantId?: string | undefined;
    language?: "ALL" | "en" | "si" | "ta" | undefined;
    exportedFilter?: "ALL" | "EXPORTED" | "NOT_EXPORTED" | undefined;
    sortBy?: "status" | "createdAt" | "completedAt" | "participantName" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const StartPublicAssessmentSchema: z.ZodObject<{
    language: z.ZodOptional<z.ZodEnum<["en", "si", "ta"]>>;
}, "strip", z.ZodTypeAny, {
    language?: "en" | "si" | "ta" | undefined;
}, {
    language?: "en" | "si" | "ta" | undefined;
}>;
export declare const SavePublicProgressSchema: z.ZodObject<{
    selectedLanguage: z.ZodOptional<z.ZodEnum<["en", "si", "ta"]>>;
    draftAnswers: z.ZodArray<z.ZodObject<{
        questionNumber: z.ZodNumber;
        selectedOption: z.ZodEnum<["A", "B", "C", "D"]>;
    }, "strip", z.ZodTypeAny, {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }, {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    draftAnswers: {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }[];
    selectedLanguage?: "en" | "si" | "ta" | undefined;
}, {
    draftAnswers: {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }[];
    selectedLanguage?: "en" | "si" | "ta" | undefined;
}>;
export declare const SubmitPublicAssessmentSchema: z.ZodObject<{
    selectedLanguage: z.ZodDefault<z.ZodEnum<["en", "si", "ta"]>>;
    answers: z.ZodArray<z.ZodObject<{
        questionNumber: z.ZodNumber;
        selectedOption: z.ZodEnum<["A", "B", "C", "D"]>;
    }, "strip", z.ZodTypeAny, {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }, {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    answers: {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }[];
    selectedLanguage: "en" | "si" | "ta";
}, {
    answers: {
        questionNumber: number;
        selectedOption: "D" | "A" | "B" | "C";
    }[];
    selectedLanguage?: "en" | "si" | "ta" | undefined;
}>;
export declare const ExportReportSchema: z.ZodObject<{
    language: z.ZodOptional<z.ZodEnum<["en", "si", "ta"]>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodEnum<["PDF"]>>;
}, "strip", z.ZodTypeAny, {
    format: "PDF";
    language?: "en" | "si" | "ta" | undefined;
    idempotencyKey?: string | undefined;
}, {
    format?: "PDF" | undefined;
    language?: "en" | "si" | "ta" | undefined;
    idempotencyKey?: string | undefined;
}>;
export declare const ListUsageQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    consultantId: z.ZodOptional<z.ZodString>;
    firmId: z.ZodOptional<z.ZodString>;
    assessmentId: z.ZodOptional<z.ZodString>;
    billingPeriod: z.ZodOptional<z.ZodString>;
    billingQuarter: z.ZodOptional<z.ZodString>;
    billableOnly: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodEnum<["json", "csv"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    format: "csv" | "json";
    firmId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    assessmentId?: string | undefined;
    consultantId?: string | undefined;
    billingPeriod?: string | undefined;
    billingQuarter?: string | undefined;
    billableOnly?: boolean | undefined;
}, {
    limit?: number | undefined;
    firmId?: string | undefined;
    page?: number | undefined;
    startDate?: string | undefined;
    format?: "csv" | "json" | undefined;
    endDate?: string | undefined;
    assessmentId?: string | undefined;
    consultantId?: string | undefined;
    billingPeriod?: string | undefined;
    billingQuarter?: string | undefined;
    billableOnly?: "true" | "false" | undefined;
}>;
export declare const UpdateConsultantAccessSchema: z.ZodObject<{
    moduleEnabled: z.ZodOptional<z.ZodBoolean>;
    suspensionReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    chargingPolicy: z.ZodOptional<z.ZodEnum<["FIRST_EXPORT_ONLY", "EVERY_EXPORT", "QUOTA_CREDIT"]>>;
    monthlyReportQuota: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lifetimeReportQuota: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    prepaidCreditsBalance: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    moduleEnabled?: boolean | undefined;
    suspensionReason?: string | null | undefined;
    chargingPolicy?: "FIRST_EXPORT_ONLY" | "EVERY_EXPORT" | "QUOTA_CREDIT" | undefined;
    monthlyReportQuota?: number | null | undefined;
    lifetimeReportQuota?: number | null | undefined;
    prepaidCreditsBalance?: number | undefined;
}, {
    moduleEnabled?: boolean | undefined;
    suspensionReason?: string | null | undefined;
    chargingPolicy?: "FIRST_EXPORT_ONLY" | "EVERY_EXPORT" | "QUOTA_CREDIT" | undefined;
    monthlyReportQuota?: number | null | undefined;
    lifetimeReportQuota?: number | null | undefined;
    prepaidCreditsBalance?: number | undefined;
}>;
export declare const UpdateInterpretationTemplatesSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    contentStatus: z.ZodEnum<["DRAFT_PENDING_CONSULTANT_REVIEW", "APPROVED"]>;
    bundles: z.ZodObject<{
        en: z.ZodObject<{
            language: z.ZodEnum<["en", "si", "ta"]>;
            translationStatus: z.ZodEnum<["VERIFIED_SOURCE", "PENDING_CONSULTANT_REVIEW", "APPROVED"]>;
            disclaimer: z.ZodString;
            fourAxisExplanation: z.ZodString;
            netCoordinateExplanation: z.ZodString;
            styles: z.ZodObject<{
                ANALYTICAL: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                AMIABLE: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                EXPRESSIVE: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                DRIVER: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
            }, "strip", z.ZodTypeAny, {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            }, {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        }, {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        }>;
        si: z.ZodObject<{
            language: z.ZodEnum<["en", "si", "ta"]>;
            translationStatus: z.ZodEnum<["VERIFIED_SOURCE", "PENDING_CONSULTANT_REVIEW", "APPROVED"]>;
            disclaimer: z.ZodString;
            fourAxisExplanation: z.ZodString;
            netCoordinateExplanation: z.ZodString;
            styles: z.ZodObject<{
                ANALYTICAL: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                AMIABLE: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                EXPRESSIVE: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                DRIVER: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
            }, "strip", z.ZodTypeAny, {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            }, {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        }, {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        }>;
        ta: z.ZodObject<{
            language: z.ZodEnum<["en", "si", "ta"]>;
            translationStatus: z.ZodEnum<["VERIFIED_SOURCE", "PENDING_CONSULTANT_REVIEW", "APPROVED"]>;
            disclaimer: z.ZodString;
            fourAxisExplanation: z.ZodString;
            netCoordinateExplanation: z.ZodString;
            styles: z.ZodObject<{
                ANALYTICAL: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                AMIABLE: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                EXPRESSIVE: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
                DRIVER: z.ZodObject<{
                    styleCode: z.ZodEnum<["ANALYTICAL", "AMIABLE", "EXPRESSIVE", "DRIVER"]>;
                    styleName: z.ZodString;
                    axisSummary: z.ZodString;
                    overview: z.ZodString;
                    communicationPreferences: z.ZodArray<z.ZodString, "many">;
                    workplaceStrengths: z.ZodArray<z.ZodString, "many">;
                    potentialChallenges: z.ZodArray<z.ZodString, "many">;
                    recommendationsForColleagues: z.ZodArray<z.ZodString, "many">;
                    recommendationsForManagers: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }, {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                }>;
            }, "strip", z.ZodTypeAny, {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            }, {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        }, {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        en: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        si: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        ta: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
    }, {
        en: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        si: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        ta: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
    }>;
}, "strip", z.ZodTypeAny, {
    version: string;
    contentStatus: "APPROVED" | "DRAFT_PENDING_CONSULTANT_REVIEW";
    bundles: {
        en: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        si: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        ta: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
    };
}, {
    contentStatus: "APPROVED" | "DRAFT_PENDING_CONSULTANT_REVIEW";
    bundles: {
        en: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        si: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
        ta: {
            language: "en" | "si" | "ta";
            translationStatus: "APPROVED" | "VERIFIED_SOURCE" | "PENDING_CONSULTANT_REVIEW";
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            styles: {
                ANALYTICAL: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                AMIABLE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                EXPRESSIVE: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
                DRIVER: {
                    styleCode: "ANALYTICAL" | "AMIABLE" | "EXPRESSIVE" | "DRIVER";
                    styleName: string;
                    axisSummary: string;
                    overview: string;
                    communicationPreferences: string[];
                    workplaceStrengths: string[];
                    potentialChallenges: string[];
                    recommendationsForColleagues: string[];
                    recommendationsForManagers: string[];
                };
            };
        };
    };
    version?: string | undefined;
}>;
