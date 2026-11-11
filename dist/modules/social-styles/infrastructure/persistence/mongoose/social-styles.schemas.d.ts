import mongoose, { Document } from 'mongoose';
import { AnswerOptionCode, SocialStyleType, SupportedSocialStyleLanguage } from '../../../domain/constants/answer-key-v1.definition';
import { FourAxisProfileData, NetBalanceCoordinateData } from '../../../domain/services/social-style-graph.service';
import { AnswerBreakdownItem, SocialStyleFinalScores, SocialStyleRawScores } from '../../../domain/services/social-style-scoring.service';
import { InterpretationTemplatesCatalog } from '../../../domain/constants/style-interpretations.definition';
import { AnswerKeyRow } from '../../../domain/constants/answer-key-v1.definition';
import { QuestionnaireQuestionDefinition, TranslationLanguageMetadata, LocalizedTextMap } from '../../../domain/constants/questionnaire-v1.definition';
export type SocialStyleAssessmentStatus = 'DRAFT' | 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'EXPIRED' | 'REVOKED' | 'CANCELLED' | 'REOPENED';
export type FirstBillableLockState = 'NONE' | 'PENDING_LEDGER' | 'COMMITTED';
export type SocialStyleChargingPolicy = 'FIRST_EXPORT_ONLY' | 'EVERY_EXPORT' | 'QUOTA_CREDIT';
export type SocialStyleUsageCategory = 'INITIAL_EXPORT' | 'RE_EXPORT' | 'RE_DOWNLOAD';
export type NonBillableReason = 'ALREADY_BILLED_FIRST_EXPORT' | 'REDOWNLOAD_EXISTING_REPORT' | 'SUPER_ADMIN_PREVIEW' | 'FREE_QUOTA_CREDIT';
export type SocialStyleAssessmentSourceChannel = 'MANUAL' | 'BULK_IMPORT' | 'QR_SELF_REGISTRATION';
export type SocialStyleInvitationEmailStatus = 'NOT_SENT' | 'SENT' | 'FAILED';
export type SocialStyleQrSessionStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REVOKED';
export interface ISocialStyleAssessmentDocument extends Document {
    assessmentId: string;
    consultantId: string;
    consultantName: string;
    consultantEmail?: string;
    firmId?: string;
    firmName?: string;
    organizationId?: string;
    organizationName?: string;
    participantId?: string;
    participantName: string;
    participantEmail: string;
    participantPhone?: string;
    title: string;
    reference?: string;
    consultantNotes?: string;
    language: SupportedSocialStyleLanguage;
    questionnaireVersion: string;
    status: SocialStyleAssessmentStatus;
    sourceChannel?: SocialStyleAssessmentSourceChannel;
    batchId?: string | null;
    qrSessionId?: string | null;
    invitationEmailStatus?: SocialStyleInvitationEmailStatus;
    invitationEmailSentAt?: Date | null;
    invitationEmailError?: string | null;
    publicTokenHash?: string;
    encryptedPublicToken?: string | null;
    tokenExpiresAt?: Date | null;
    tokenRevokedAt?: Date | null;
    invitedAt?: Date | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
    reviewedAt?: Date | null;
    firstBillableExportId?: string | null;
    firstBillableLockState: FirstBillableLockState;
    firstBillableLockedAt?: Date | null;
    firstExportedAt?: Date | null;
    lastReportExportedAt?: Date | null;
    reportExportCount: number;
    billableExportCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleAssessmentModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleAnswerItem {
    questionNumber: number;
    selectedOption: AnswerOptionCode;
}
export interface ISocialStyleResponseDocument extends Document {
    responseId: string;
    assessmentId: string;
    consultantId: string;
    questionnaireVersion: string;
    selectedLanguage: SupportedSocialStyleLanguage;
    draftAnswers: ISocialStyleAnswerItem[];
    answers: ISocialStyleAnswerItem[];
    isSubmitted: boolean;
    lastSavedAt?: Date | null;
    submittedAt?: Date | null;
    respondentUserAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleResponseModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleResultDocument extends Document {
    resultId: string;
    assessmentId: string;
    consultantId: string;
    questionnaireVersion: string;
    scoringVersion: string;
    graphVersion: string;
    answerBreakdown: AnswerBreakdownItem[];
    rawScores: SocialStyleRawScores;
    finalScores: SocialStyleFinalScores;
    fourAxisProfile: FourAxisProfileData;
    netBalanceCoordinate: NetBalanceCoordinateData;
    highestScoredStyles: SocialStyleType[];
    calculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleResultModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleReportDocument extends Document {
    reportId: string;
    assessmentId: string;
    consultantId: string;
    firmId?: string;
    reportVersion: string;
    scoringVersion: string;
    interpretationVersion: string;
    language: SupportedSocialStyleLanguage;
    fileName: string;
    fileSizeBytes: number;
    checksumSha256: string;
    storageReference?: string;
    status: 'GENERATED' | 'FAILED';
    usageEventId?: string;
    billable: boolean;
    generatedBy: string;
    generatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleReportModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleUsageEventDocument extends Document {
    eventId: string;
    idempotencyKey: string;
    firstExportLockKey?: string;
    consultantId: string;
    consultantName: string;
    consultantEmail?: string;
    firmId?: string;
    firmName?: string;
    organizationId?: string;
    organizationName?: string;
    assessmentId: string;
    participantName: string;
    reportId: string;
    eventType: 'REPORT_EXPORTED' | 'REPORT_REDOWNLOADED';
    usageCategory: SocialStyleUsageCategory;
    chargingPolicyApplied: SocialStyleChargingPolicy;
    billable: boolean;
    nonBillableReason?: NonBillableReason;
    exportFormat: 'PDF';
    reportVersion: string;
    language: SupportedSocialStyleLanguage;
    billingPeriod: string;
    billingQuarter: string;
    billingYear: number;
    triggeredByUserId: string;
    triggeredByRole: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const SocialStyleUsageEventModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleQuestionnaireDocument extends Document {
    version: string;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    supportedLanguages: SupportedSocialStyleLanguage[];
    translationMetadata: Record<SupportedSocialStyleLanguage, TranslationLanguageMetadata>;
    instructions: LocalizedTextMap;
    questions: QuestionnaireQuestionDefinition[];
    answerKey: AnswerKeyRow[];
    scoringRules: {
        pointsPerQuestion: number;
        rawScoreMultiplier: number;
        expectedTotalRaw: number;
        expectedTotalFinal: number;
    };
    interpretationTemplates: InterpretationTemplatesCatalog;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleQuestionnaireModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleConsultantSettingsDocument extends Document {
    consultantId: string;
    firmId?: string;
    moduleEnabled: boolean;
    suspensionReason?: string | null;
    suspendedAt?: Date | null;
    suspendedBy?: string | null;
    chargingPolicy: SocialStyleChargingPolicy;
    monthlyReportQuota?: number | null;
    lifetimeReportQuota?: number | null;
    prepaidCreditsBalance: number;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleConsultantSettingsModel: mongoose.Model<any, {}, {}, {}, any, any>;
export interface ISocialStyleQrSessionDocument extends Document {
    qrSessionId: string;
    consultantId: string;
    consultantName: string;
    consultantEmail?: string;
    firmId?: string;
    firmName?: string;
    organizationId?: string;
    organizationName?: string;
    title: string;
    reference?: string;
    consultantNotes?: string;
    language: SupportedSocialStyleLanguage;
    assessmentLinkExpiryDays: number;
    status: SocialStyleQrSessionStatus;
    sessionTokenHash: string;
    encryptedSessionToken: string;
    expiresAt?: Date | null;
    maxParticipants?: number | null;
    requirePhone: boolean;
    sendBackupEmail: boolean;
    registeredCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SocialStyleQrSessionModel: mongoose.Model<any, {}, {}, {}, any, any>;
/**
 * Helper to derive UTC billingPeriod ('YYYY-MM'), billingQuarter ('YYYY-Q#'), and billingYear
 */
export declare function deriveBillingTimeBuckets(date?: Date): {
    billingPeriod: string;
    billingQuarter: string;
    billingYear: number;
};
