"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStyleQrSessionModel = exports.SocialStyleConsultantSettingsModel = exports.SocialStyleQuestionnaireModel = exports.SocialStyleUsageEventModel = exports.SocialStyleReportModel = exports.SocialStyleResultModel = exports.SocialStyleResponseModel = exports.SocialStyleAssessmentModel = void 0;
exports.deriveBillingTimeBuckets = deriveBillingTimeBuckets;
const mongoose_1 = __importStar(require("mongoose"));
const SocialStyleAssessmentSchema = new mongoose_1.Schema({
    assessmentId: {
        type: String,
        required: true,
        unique: true,
        match: /^SSA-[A-Z0-9-]{6,40}$/,
        index: true,
    },
    consultantId: { type: String, required: true, index: true },
    consultantName: { type: String, required: true, trim: true, maxlength: 150 },
    consultantEmail: { type: String, lowercase: true, trim: true, maxlength: 150 },
    firmId: { type: String, index: true },
    firmName: { type: String, trim: true, maxlength: 150 },
    organizationId: { type: String, index: true },
    organizationName: { type: String, trim: true, maxlength: 200 },
    participantId: { type: String, trim: true, maxlength: 100 },
    participantName: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    participantEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        maxlength: 150,
    },
    participantPhone: { type: String, trim: true, maxlength: 30 },
    title: {
        type: String,
        default: 'Social Styles Assessment',
        trim: true,
        maxlength: 200,
    },
    reference: { type: String, trim: true, maxlength: 100 },
    consultantNotes: { type: String, trim: true, maxlength: 5000 },
    language: {
        type: String,
        enum: ['en', 'si', 'ta'],
        default: 'en',
        required: true,
    },
    questionnaireVersion: { type: String, default: 'v1.0', required: true },
    status: {
        type: String,
        enum: [
            'DRAFT',
            'INVITED',
            'IN_PROGRESS',
            'COMPLETED',
            'REVIEWED',
            'EXPIRED',
            'REVOKED',
            'CANCELLED',
            'REOPENED',
        ],
        default: 'DRAFT',
        required: true,
        index: true,
    },
    sourceChannel: {
        type: String,
        enum: ['MANUAL', 'BULK_IMPORT', 'QR_SELF_REGISTRATION'],
        default: 'MANUAL',
        index: true,
    },
    batchId: { type: String, default: null, index: true },
    qrSessionId: { type: String, default: null, index: true },
    invitationEmailStatus: {
        type: String,
        enum: ['NOT_SENT', 'SENT', 'FAILED'],
        default: 'NOT_SENT',
    },
    invitationEmailSentAt: { type: Date, default: null },
    invitationEmailError: { type: String, default: null, maxlength: 500 },
    publicTokenHash: { type: String },
    encryptedPublicToken: { type: String, default: null },
    tokenExpiresAt: { type: Date, default: null },
    tokenRevokedAt: { type: Date, default: null },
    invitedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    firstBillableExportId: { type: String, default: null },
    firstBillableLockState: {
        type: String,
        enum: ['NONE', 'PENDING_LEDGER', 'COMMITTED'],
        default: 'NONE',
    },
    firstBillableLockedAt: { type: Date, default: null },
    firstExportedAt: { type: Date, default: null },
    lastReportExportedAt: { type: Date, default: null },
    reportExportCount: { type: Number, default: 0, min: 0 },
    billableExportCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: String, required: true },
}, {
    collection: 'social_style_assessments',
    timestamps: true,
});
SocialStyleAssessmentSchema.index({ publicTokenHash: 1 }, { unique: true, sparse: true });
SocialStyleAssessmentSchema.index({ consultantId: 1, createdAt: -1 });
SocialStyleAssessmentSchema.index({ consultantId: 1, status: 1, createdAt: -1 });
SocialStyleAssessmentSchema.index({ consultantId: 1, participantEmail: 1 });
SocialStyleAssessmentSchema.index({ qrSessionId: 1, participantEmail: 1 });
SocialStyleAssessmentSchema.index({ firmId: 1, createdAt: -1 });
SocialStyleAssessmentSchema.index({ status: 1, completedAt: -1 });
exports.SocialStyleAssessmentModel = mongoose_1.default.models.SocialStyleAssessment ||
    mongoose_1.default.model('SocialStyleAssessment', SocialStyleAssessmentSchema);
const AnswerItemSubSchema = new mongoose_1.Schema({
    questionNumber: { type: Number, required: true, min: 1, max: 20 },
    selectedOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
}, { _id: false });
const SocialStyleResponseSchema = new mongoose_1.Schema({
    responseId: { type: String, required: true, unique: true, index: true },
    assessmentId: { type: String, required: true, unique: true, index: true },
    consultantId: { type: String, required: true, index: true },
    questionnaireVersion: { type: String, default: 'v1.0', required: true },
    selectedLanguage: {
        type: String,
        enum: ['en', 'si', 'ta'],
        default: 'en',
        required: true,
    },
    draftAnswers: { type: [AnswerItemSubSchema], default: [] },
    answers: { type: [AnswerItemSubSchema], default: [] },
    isSubmitted: { type: Boolean, default: false, required: true },
    lastSavedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    respondentUserAgent: { type: String, maxlength: 500 },
}, {
    collection: 'social_style_responses',
    timestamps: true,
});
SocialStyleResponseSchema.index({ consultantId: 1, submittedAt: -1 });
exports.SocialStyleResponseModel = mongoose_1.default.models.SocialStyleResponse ||
    mongoose_1.default.model('SocialStyleResponse', SocialStyleResponseSchema);
const SocialStyleResultSchema = new mongoose_1.Schema({
    resultId: { type: String, required: true, unique: true, index: true },
    assessmentId: { type: String, required: true, unique: true, index: true },
    consultantId: { type: String, required: true, index: true },
    questionnaireVersion: { type: String, default: 'v1.0', required: true },
    scoringVersion: { type: String, default: 'v1.0', required: true },
    graphVersion: { type: String, default: 'v1.0-option-a', required: true },
    answerBreakdown: [
        {
            questionNumber: { type: Number, required: true, min: 1, max: 20 },
            selectedOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
            mappedStyle: {
                type: String,
                enum: ['ANALYTICAL', 'AMIABLE', 'EXPRESSIVE', 'DRIVER'],
                required: true,
            },
            _id: false,
        },
    ],
    rawScores: {
        analytical: { type: Number, required: true, min: 0, max: 20 },
        amiable: { type: Number, required: true, min: 0, max: 20 },
        expressive: { type: Number, required: true, min: 0, max: 20 },
        driver: { type: Number, required: true, min: 0, max: 20 },
        total: { type: Number, required: true, default: 20 },
    },
    finalScores: {
        analytical: { type: Number, required: true, min: 0, max: 100 },
        amiable: { type: Number, required: true, min: 0, max: 100 },
        expressive: { type: Number, required: true, min: 0, max: 100 },
        driver: { type: Number, required: true, min: 0, max: 100 },
        total: { type: Number, required: true, default: 100 },
    },
    fourAxisProfile: {
        leftAnalytical: { type: Number, required: true },
        rightExpressive: { type: Number, required: true },
        topDriver: { type: Number, required: true },
        bottomAmiable: { type: Number, required: true },
        tickMarks: {
            leftAnalytical: { type: Number, required: true },
            rightExpressive: { type: Number, required: true },
            topDriver: { type: Number, required: true },
            bottomAmiable: { type: Number, required: true },
        },
    },
    netBalanceCoordinate: {
        x: { type: Number, required: true, min: -100, max: 100 },
        y: { type: Number, required: true, min: -100, max: 100 },
        normalizedX: { type: Number, required: true, min: -1, max: 1 },
        normalizedY: { type: Number, required: true, min: -1, max: 1 },
        horizontalTendency: {
            type: String,
            enum: ['ANALYTICAL', 'EXPRESSIVE', 'BALANCED'],
            required: true,
        },
        verticalTendency: {
            type: String,
            enum: ['DRIVER', 'AMIABLE', 'BALANCED'],
            required: true,
        },
        quadrantRegion: {
            type: String,
            enum: [
                'DRIVER_EXPRESSIVE',
                'DRIVER_ANALYTICAL',
                'AMIABLE_EXPRESSIVE',
                'AMIABLE_ANALYTICAL',
                'AXIS_BOUNDARY',
                'ORIGIN_BALANCED',
            ],
            required: true,
        },
    },
    highestScoredStyles: [
        {
            type: String,
            enum: ['ANALYTICAL', 'AMIABLE', 'EXPRESSIVE', 'DRIVER'],
            required: true,
        },
    ],
    calculatedAt: { type: Date, default: Date.now, required: true },
}, {
    collection: 'social_style_results',
    timestamps: true,
});
SocialStyleResultSchema.index({ consultantId: 1, calculatedAt: -1 });
exports.SocialStyleResultModel = mongoose_1.default.models.SocialStyleResult ||
    mongoose_1.default.model('SocialStyleResult', SocialStyleResultSchema);
const SocialStyleReportSchema = new mongoose_1.Schema({
    reportId: { type: String, required: true, unique: true, index: true },
    assessmentId: { type: String, required: true, index: true },
    consultantId: { type: String, required: true, index: true },
    firmId: { type: String, index: true },
    reportVersion: { type: String, default: 'v1.0', required: true },
    scoringVersion: { type: String, default: 'v1.0', required: true },
    interpretationVersion: { type: String, default: 'v1.0', required: true },
    language: {
        type: String,
        enum: ['en', 'si', 'ta'],
        default: 'en',
        required: true,
    },
    fileName: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true, min: 1 },
    checksumSha256: { type: String, required: true },
    storageReference: { type: String },
    status: {
        type: String,
        enum: ['GENERATED', 'FAILED'],
        default: 'GENERATED',
        required: true,
    },
    usageEventId: { type: String, index: true },
    billable: { type: Boolean, required: true },
    generatedBy: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now, required: true },
}, {
    collection: 'social_style_reports',
    timestamps: true,
});
SocialStyleReportSchema.index({ assessmentId: 1, generatedAt: -1 });
SocialStyleReportSchema.index({ consultantId: 1, generatedAt: -1 });
exports.SocialStyleReportModel = mongoose_1.default.models.SocialStyleReport ||
    mongoose_1.default.model('SocialStyleReport', SocialStyleReportSchema);
const SocialStyleUsageEventSchema = new mongoose_1.Schema({
    eventId: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    firstExportLockKey: { type: String },
    consultantId: { type: String, required: true, index: true },
    consultantName: { type: String, required: true },
    consultantEmail: { type: String },
    firmId: { type: String, index: true },
    firmName: { type: String },
    organizationId: { type: String, index: true },
    organizationName: { type: String },
    assessmentId: { type: String, required: true, index: true },
    participantName: { type: String, required: true },
    reportId: { type: String, required: true, unique: true, index: true },
    eventType: {
        type: String,
        enum: ['REPORT_EXPORTED', 'REPORT_REDOWNLOADED'],
        default: 'REPORT_EXPORTED',
        required: true,
    },
    usageCategory: {
        type: String,
        enum: ['INITIAL_EXPORT', 'RE_EXPORT', 'RE_DOWNLOAD'],
        required: true,
    },
    chargingPolicyApplied: {
        type: String,
        enum: ['FIRST_EXPORT_ONLY', 'EVERY_EXPORT', 'QUOTA_CREDIT'],
        default: 'FIRST_EXPORT_ONLY',
        required: true,
    },
    billable: { type: Boolean, required: true, index: true },
    nonBillableReason: {
        type: String,
        enum: [
            'ALREADY_BILLED_FIRST_EXPORT',
            'REDOWNLOAD_EXISTING_REPORT',
            'SUPER_ADMIN_PREVIEW',
            'FREE_QUOTA_CREDIT',
        ],
    },
    exportFormat: { type: String, enum: ['PDF'], default: 'PDF', required: true },
    reportVersion: { type: String, default: 'v1.0', required: true },
    language: { type: String, enum: ['en', 'si', 'ta'], default: 'en', required: true },
    billingPeriod: {
        type: String,
        required: true,
        match: /^\d{4}-(0[1-9]|1[0-2])$/,
        index: true,
    },
    billingQuarter: {
        type: String,
        required: true,
        match: /^\d{4}-Q[1-4]$/,
        index: true,
    },
    billingYear: { type: Number, required: true, index: true },
    triggeredByUserId: { type: String, required: true },
    triggeredByRole: { type: String, required: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, immutable: true, index: true },
}, {
    collection: 'social_style_usage_events',
    timestamps: false,
});
SocialStyleUsageEventSchema.index({ firstExportLockKey: 1 }, { unique: true, sparse: true });
SocialStyleUsageEventSchema.index({ consultantId: 1, billable: 1, createdAt: -1 });
SocialStyleUsageEventSchema.index({ consultantId: 1, billingPeriod: 1, billable: 1 });
SocialStyleUsageEventSchema.index({ billingPeriod: 1, billable: 1, consultantId: 1 });
SocialStyleUsageEventSchema.index({ billingQuarter: 1, billable: 1, consultantId: 1 });
SocialStyleUsageEventSchema.index({ billingYear: 1, billable: 1, consultantId: 1 });
SocialStyleUsageEventSchema.index({ assessmentId: 1, createdAt: -1 });
exports.SocialStyleUsageEventModel = mongoose_1.default.models.SocialStyleUsageEvent ||
    mongoose_1.default.model('SocialStyleUsageEvent', SocialStyleUsageEventSchema);
const SocialStyleQuestionnaireSchema = new mongoose_1.Schema({
    version: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
        default: 'ACTIVE',
        required: true,
        index: true,
    },
    supportedLanguages: { type: [String], default: ['en', 'si', 'ta'], required: true },
    translationMetadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    instructions: { type: mongoose_1.Schema.Types.Mixed, required: true },
    questions: { type: mongoose_1.Schema.Types.Mixed, required: true },
    answerKey: { type: mongoose_1.Schema.Types.Mixed, required: true },
    scoringRules: {
        pointsPerQuestion: { type: Number, default: 1 },
        rawScoreMultiplier: { type: Number, default: 5 },
        expectedTotalRaw: { type: Number, default: 20 },
        expectedTotalFinal: { type: Number, default: 100 },
    },
    interpretationTemplates: { type: mongoose_1.Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: 'SYSTEM_SEEDER' },
}, {
    collection: 'social_style_questionnaires',
    timestamps: true,
});
exports.SocialStyleQuestionnaireModel = mongoose_1.default.models.SocialStyleQuestionnaire ||
    mongoose_1.default.model('SocialStyleQuestionnaire', SocialStyleQuestionnaireSchema);
const SocialStyleConsultantSettingsSchema = new mongoose_1.Schema({
    consultantId: { type: String, required: true, unique: true, index: true },
    firmId: { type: String, index: true },
    moduleEnabled: { type: Boolean, default: true, required: true, index: true },
    suspensionReason: { type: String, default: null, maxlength: 500 },
    suspendedAt: { type: Date, default: null },
    suspendedBy: { type: String, default: null },
    chargingPolicy: {
        type: String,
        enum: ['FIRST_EXPORT_ONLY', 'EVERY_EXPORT', 'QUOTA_CREDIT'],
        default: 'FIRST_EXPORT_ONLY',
        required: true,
    },
    monthlyReportQuota: { type: Number, default: null, min: 0 },
    lifetimeReportQuota: { type: Number, default: null, min: 0 },
    prepaidCreditsBalance: { type: Number, default: 0, min: 0 },
    updatedBy: { type: String },
}, {
    collection: 'social_style_consultant_settings',
    timestamps: true,
});
exports.SocialStyleConsultantSettingsModel = mongoose_1.default.models.SocialStyleConsultantSettings ||
    mongoose_1.default.model('SocialStyleConsultantSettings', SocialStyleConsultantSettingsSchema);
const SocialStyleQrSessionSchema = new mongoose_1.Schema({
    qrSessionId: {
        type: String,
        required: true,
        unique: true,
        match: /^SSQ-[A-Z0-9-]{6,40}$/,
        index: true,
    },
    consultantId: { type: String, required: true, index: true },
    consultantName: { type: String, required: true, trim: true, maxlength: 150 },
    consultantEmail: { type: String, lowercase: true, trim: true, maxlength: 150 },
    firmId: { type: String, index: true },
    firmName: { type: String, trim: true, maxlength: 150 },
    organizationId: { type: String, index: true },
    organizationName: { type: String, trim: true, maxlength: 200 },
    title: {
        type: String,
        default: 'Social Styles Classroom Assessment',
        trim: true,
        maxlength: 200,
    },
    reference: { type: String, trim: true, maxlength: 100 },
    consultantNotes: { type: String, trim: true, maxlength: 5000 },
    language: {
        type: String,
        enum: ['en', 'si', 'ta'],
        default: 'en',
        required: true,
    },
    assessmentLinkExpiryDays: { type: Number, default: 14, min: 1, max: 365 },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAUSED', 'EXPIRED', 'REVOKED'],
        default: 'ACTIVE',
        required: true,
        index: true,
    },
    sessionTokenHash: { type: String, required: true, unique: true, index: true },
    encryptedSessionToken: { type: String, required: true },
    expiresAt: { type: Date, default: null },
    maxParticipants: { type: Number, default: null, min: 1 },
    requirePhone: { type: Boolean, default: false },
    sendBackupEmail: { type: Boolean, default: true },
    registeredCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: String, required: true },
}, {
    collection: 'social_style_qr_sessions',
    timestamps: true,
});
SocialStyleQrSessionSchema.index({ consultantId: 1, createdAt: -1 });
SocialStyleQrSessionSchema.index({ consultantId: 1, status: 1 });
exports.SocialStyleQrSessionModel = mongoose_1.default.models.SocialStyleQrSession ||
    mongoose_1.default.model('SocialStyleQrSession', SocialStyleQrSessionSchema);
/**
 * Helper to derive UTC billingPeriod ('YYYY-MM'), billingQuarter ('YYYY-Q#'), and billingYear
 */
function deriveBillingTimeBuckets(date = new Date()) {
    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth(); // 0..11
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const quarter = Math.floor(monthIndex / 3) + 1;
    return {
        billingPeriod: `${year}-${monthStr}`,
        billingQuarter: `${year}-Q${quarter}`,
        billingYear: year,
    };
}
//# sourceMappingURL=social-styles.schemas.js.map