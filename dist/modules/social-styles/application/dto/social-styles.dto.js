"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterpretationTemplatesSchema = exports.UpdateConsultantAccessSchema = exports.ListUsageQuerySchema = exports.ExportReportSchema = exports.SubmitPublicAssessmentSchema = exports.SavePublicProgressSchema = exports.StartPublicAssessmentSchema = exports.RegisterViaQrSessionSchema = exports.UpdateQrSessionSchema = exports.CreateQrSessionSchema = exports.BulkCreateAssessmentsSchema = exports.ListAssessmentsQuerySchema = exports.ReopenAssessmentSchema = exports.GenerateLinkSchema = exports.UpdateAssessmentSchema = exports.CreateAssessmentSchema = exports.AnswerOptionEnum = exports.SupportedLanguageEnum = void 0;
const zod_1 = require("zod");
exports.SupportedLanguageEnum = zod_1.z.enum(['en', 'si', 'ta']);
exports.AnswerOptionEnum = zod_1.z.enum(['A', 'B', 'C', 'D']);
exports.CreateAssessmentSchema = zod_1.z.object({
    participantName: zod_1.z.string().trim().min(2, 'participantName must be at least 2 characters').max(150),
    participantEmail: zod_1.z.string().trim().toLowerCase().email('Valid participantEmail is required').max(150),
    participantPhone: zod_1.z.string().trim().max(30).optional(),
    organizationName: zod_1.z.string().trim().max(200).optional(),
    organizationId: zod_1.z.string().trim().max(50).optional(),
    participantId: zod_1.z.string().trim().max(100).optional(),
    title: zod_1.z.string().trim().min(2).max(200).optional(),
    reference: zod_1.z.string().trim().max(100).optional(),
    consultantNotes: zod_1.z.string().trim().max(5000).optional(),
    language: exports.SupportedLanguageEnum.default('en'),
    tokenExpiresAt: zod_1.z.string().datetime().optional(),
    generatePublicLinkNow: zod_1.z.boolean().default(true),
});
exports.UpdateAssessmentSchema = zod_1.z.object({
    participantName: zod_1.z.string().trim().min(2).max(150).optional(),
    participantEmail: zod_1.z.string().trim().toLowerCase().email().max(150).optional(),
    participantPhone: zod_1.z.string().trim().max(30).nullable().optional(),
    organizationName: zod_1.z.string().trim().max(200).nullable().optional(),
    title: zod_1.z.string().trim().min(2).max(200).optional(),
    reference: zod_1.z.string().trim().max(100).nullable().optional(),
    consultantNotes: zod_1.z.string().trim().max(5000).nullable().optional(),
    language: exports.SupportedLanguageEnum.optional(),
    tokenExpiresAt: zod_1.z.string().datetime().nullable().optional(),
});
exports.GenerateLinkSchema = zod_1.z.object({
    tokenExpiresAt: zod_1.z.string().datetime().optional(),
});
exports.ReopenAssessmentSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().max(500).optional(),
    tokenExpiresAt: zod_1.z.string().datetime().optional(),
});
exports.ListAssessmentsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().trim().max(150).optional(),
    status: zod_1.z
        .enum([
        'ALL',
        'DRAFT',
        'INVITED',
        'IN_PROGRESS',
        'COMPLETED',
        'REVIEWED',
        'EXPIRED',
        'REVOKED',
        'CANCELLED',
        'REOPENED',
    ])
        .default('ALL'),
    exportedFilter: zod_1.z.enum(['ALL', 'EXPORTED', 'NOT_EXPORTED']).default('ALL'),
    language: zod_1.z.enum(['ALL', 'en', 'si', 'ta']).default('ALL'),
    sortBy: zod_1.z.enum(['createdAt', 'completedAt', 'participantName', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    consultantId: zod_1.z.string().trim().optional(),
    qrSessionId: zod_1.z.string().trim().optional(),
    batchId: zod_1.z.string().trim().optional(),
});
exports.BulkCreateAssessmentsSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).max(200).optional(),
    organizationName: zod_1.z.string().trim().max(200).optional(),
    organizationId: zod_1.z.string().trim().max(50).optional(),
    reference: zod_1.z.string().trim().max(100).optional(),
    consultantNotes: zod_1.z.string().trim().max(5000).optional(),
    language: exports.SupportedLanguageEnum.default('en'),
    tokenExpiresAt: zod_1.z.string().datetime().optional(),
    sendInvitationEmails: zod_1.z.boolean().default(true),
    participants: zod_1.z
        .array(zod_1.z.object({
        participantName: zod_1.z.string().trim().min(2, 'participantName must be at least 2 characters').max(150),
        participantEmail: zod_1.z.string().trim().toLowerCase().email('Valid participantEmail is required').max(150),
        participantPhone: zod_1.z.string().trim().max(30).optional(),
        organizationName: zod_1.z.string().trim().max(200).optional(),
        reference: zod_1.z.string().trim().max(100).optional(),
        consultantNotes: zod_1.z.string().trim().max(5000).optional(),
        language: exports.SupportedLanguageEnum.optional(),
    }))
        .min(1, 'At least 1 participant is required')
        .max(200, 'Maximum 200 participants per bulk import batch'),
});
exports.CreateQrSessionSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).max(200).default('Social Styles Classroom Assessment'),
    organizationName: zod_1.z.string().trim().max(200).optional(),
    organizationId: zod_1.z.string().trim().max(50).optional(),
    reference: zod_1.z.string().trim().max(100).optional(),
    consultantNotes: zod_1.z.string().trim().max(5000).optional(),
    language: exports.SupportedLanguageEnum.default('en'),
    assessmentLinkExpiryDays: zod_1.z.number().int().min(1).max(365).default(14),
    expiresAt: zod_1.z.string().datetime().optional(),
    maxParticipants: zod_1.z.number().int().min(1).max(5000).nullable().optional(),
    requirePhone: zod_1.z.boolean().default(false),
    sendBackupEmail: zod_1.z.boolean().default(true),
});
exports.UpdateQrSessionSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).max(200).optional(),
    organizationName: zod_1.z.string().trim().max(200).nullable().optional(),
    reference: zod_1.z.string().trim().max(100).nullable().optional(),
    consultantNotes: zod_1.z.string().trim().max(5000).nullable().optional(),
    language: exports.SupportedLanguageEnum.optional(),
    assessmentLinkExpiryDays: zod_1.z.number().int().min(1).max(365).optional(),
    status: zod_1.z.enum(['ACTIVE', 'PAUSED', 'REVOKED']).optional(),
    expiresAt: zod_1.z.string().datetime().nullable().optional(),
    maxParticipants: zod_1.z.number().int().min(1).max(5000).nullable().optional(),
    requirePhone: zod_1.z.boolean().optional(),
    sendBackupEmail: zod_1.z.boolean().optional(),
});
exports.RegisterViaQrSessionSchema = zod_1.z.object({
    participantName: zod_1.z.string().trim().min(2, 'Full name is required (at least 2 characters)').max(150),
    participantEmail: zod_1.z.string().trim().toLowerCase().email('Valid email address is required').max(150),
    participantPhone: zod_1.z.string().trim().max(30).optional(),
    selectedLanguage: exports.SupportedLanguageEnum.optional(),
});
exports.StartPublicAssessmentSchema = zod_1.z.object({
    language: exports.SupportedLanguageEnum.optional(),
});
exports.SavePublicProgressSchema = zod_1.z.object({
    selectedLanguage: exports.SupportedLanguageEnum.optional(),
    draftAnswers: zod_1.z
        .array(zod_1.z.object({
        questionNumber: zod_1.z.number().int().min(1).max(20),
        selectedOption: exports.AnswerOptionEnum,
    }))
        .max(20),
});
exports.SubmitPublicAssessmentSchema = zod_1.z.object({
    selectedLanguage: exports.SupportedLanguageEnum.default('en'),
    answers: zod_1.z
        .array(zod_1.z.object({
        questionNumber: zod_1.z.number().int().min(1).max(20),
        selectedOption: exports.AnswerOptionEnum,
    }))
        .length(20, 'Exactly 20 answers are required for final submission.'),
});
exports.ExportReportSchema = zod_1.z.object({
    language: exports.SupportedLanguageEnum.optional(),
    idempotencyKey: zod_1.z.string().trim().min(4).max(128).optional(),
    format: zod_1.z.enum(['PDF']).default('PDF'),
});
exports.ListUsageQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(20),
    consultantId: zod_1.z.string().trim().optional(),
    firmId: zod_1.z.string().trim().optional(),
    assessmentId: zod_1.z.string().trim().optional(),
    billingPeriod: zod_1.z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
        .optional(),
    billingQuarter: zod_1.z
        .string()
        .regex(/^\d{4}-Q[1-4]$/)
        .optional(),
    billableOnly: zod_1.z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    format: zod_1.z.enum(['json', 'csv']).default('json'),
});
exports.UpdateConsultantAccessSchema = zod_1.z.object({
    moduleEnabled: zod_1.z.boolean().optional(),
    suspensionReason: zod_1.z.string().trim().max(500).nullable().optional(),
    chargingPolicy: zod_1.z.enum(['FIRST_EXPORT_ONLY', 'EVERY_EXPORT', 'QUOTA_CREDIT']).optional(),
    monthlyReportQuota: zod_1.z.number().int().min(0).nullable().optional(),
    lifetimeReportQuota: zod_1.z.number().int().min(0).nullable().optional(),
    prepaidCreditsBalance: zod_1.z.number().int().min(0).optional(),
});
const StyleGuidanceItemSchema = zod_1.z.object({
    styleCode: zod_1.z.enum(['ANALYTICAL', 'AMIABLE', 'EXPRESSIVE', 'DRIVER']),
    styleName: zod_1.z.string().trim().min(1).max(120),
    axisSummary: zod_1.z.string().trim().min(1).max(300),
    overview: zod_1.z.string().trim().min(10).max(2000),
    communicationPreferences: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).max(10),
    workplaceStrengths: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).max(10),
    potentialChallenges: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).max(10),
    recommendationsForColleagues: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).max(10),
    recommendationsForManagers: zod_1.z.array(zod_1.z.string().trim().min(1)).min(1).max(10),
});
const LocalizedBundleSchema = zod_1.z.object({
    language: exports.SupportedLanguageEnum,
    translationStatus: zod_1.z.enum(['VERIFIED_SOURCE', 'PENDING_CONSULTANT_REVIEW', 'APPROVED']),
    disclaimer: zod_1.z.string().trim().min(20).max(2000),
    fourAxisExplanation: zod_1.z.string().trim().min(10).max(1000),
    netCoordinateExplanation: zod_1.z.string().trim().min(10).max(1000),
    styles: zod_1.z.object({
        ANALYTICAL: StyleGuidanceItemSchema,
        AMIABLE: StyleGuidanceItemSchema,
        EXPRESSIVE: StyleGuidanceItemSchema,
        DRIVER: StyleGuidanceItemSchema,
    }),
});
exports.UpdateInterpretationTemplatesSchema = zod_1.z.object({
    version: zod_1.z.string().trim().min(1).max(32).default('v1.0'),
    contentStatus: zod_1.z.enum(['DRAFT_PENDING_CONSULTANT_REVIEW', 'APPROVED']),
    bundles: zod_1.z.object({
        en: LocalizedBundleSchema,
        si: LocalizedBundleSchema,
        ta: LocalizedBundleSchema,
    }),
});
//# sourceMappingURL=social-styles.dto.js.map