import { SupportedSocialStyleLanguage } from '../../../domain/constants/answer-key-v1.definition';
import { InterpretationTemplatesCatalog } from '../../../domain/constants/style-interpretations.definition';
import { FirstBillableLockState, ISocialStyleAnswerItem, NonBillableReason, SocialStyleAssessmentSourceChannel, SocialStyleAssessmentStatus, SocialStyleChargingPolicy, SocialStyleInvitationEmailStatus, SocialStyleQrSessionStatus, SocialStyleUsageCategory } from './social-styles.schemas';
import { AnswerBreakdownItem, SocialStyleFinalScores, SocialStyleRawScores } from '../../../domain/services/social-style-scoring.service';
import { FourAxisProfileData, NetBalanceCoordinateData } from '../../../domain/services/social-style-graph.service';
import { SocialStyleType } from '../../../domain/constants/answer-key-v1.definition';
export interface SocialStyleAssessmentRecord {
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
export interface SocialStyleResponseRecord {
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
export interface SocialStyleResultRecord {
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
export interface SocialStyleReportRecord {
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
export interface SocialStyleUsageEventRecord {
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
export interface SocialStyleConsultantSettingsRecord {
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
export interface SocialStyleQrSessionRecord {
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
export interface ListAssessmentsFilter {
    consultantId?: string;
    firmId?: string;
    status?: string;
    exportedFilter?: 'ALL' | 'EXPORTED' | 'NOT_EXPORTED';
    language?: string;
    qrSessionId?: string;
    batchId?: string;
    search?: string;
    sortBy?: 'createdAt' | 'completedAt' | 'participantName' | 'status';
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
}
export interface ListUsageEventsFilter {
    consultantId?: string;
    firmId?: string;
    assessmentId?: string;
    billingPeriod?: string;
    billingQuarter?: string;
    billableOnly?: boolean;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
}
/**
 * Unified repository for all 7 Social Styles collections.
 * Supports both live MongoDB (Mongoose) and an atomic in-memory engine when MongoDB is disconnected
 * so unit, integration, and high-concurrency tests run deterministically in any environment.
 */
export declare class SocialStylesRepository {
    private static readonly STALE_LOCK_TIMEOUT_MS;
    private static sharedAssessments;
    private static sharedResponses;
    private static sharedResults;
    private static sharedReports;
    private static sharedUsageEvents;
    private static sharedIdempotencyIndex;
    private static sharedFirstExportLockIndex;
    private static sharedConsultantSettings;
    private static sharedQrSessions;
    private static sharedInterpretationCatalog;
    private static sharedFailNextLedgerInsertCount;
    private static sharedFailNextReportSaveCount;
    private get assessments();
    private get responses();
    private get results();
    private get reports();
    private get usageEvents();
    private get idempotencyIndex();
    private get firstExportLockIndex();
    private get consultantSettings();
    private get qrSessions();
    private get interpretationCatalog();
    private set interpretationCatalog(value);
    private get failNextLedgerInsertCount();
    private set failNextLedgerInsertCount(value);
    private get failNextReportSaveCount();
    private set failNextReportSaveCount(value);
    private get isMongoConnected();
    clearMemoryStores(): void;
    injectFaultNextLedgerInsert(count?: number): void;
    setSimulateLedgerFailureOnce(enabled: boolean): void;
    injectFaultNextReportSave(count?: number): void;
    setSimulateReportSaveFailureOnce(enabled: boolean): void;
    createAssessment(record: Omit<SocialStyleAssessmentRecord, 'createdAt' | 'updatedAt'>): Promise<SocialStyleAssessmentRecord>;
    findAssessmentById(assessmentId: string, consultantIdScope?: string): Promise<SocialStyleAssessmentRecord | null>;
    findAssessmentByPublicTokenHash(publicTokenHash: string): Promise<SocialStyleAssessmentRecord | null>;
    updateAssessment(assessmentId: string, updates: Partial<SocialStyleAssessmentRecord>, consultantIdScope?: string): Promise<SocialStyleAssessmentRecord | null>;
    /**
     * Atomic Compare-And-Swap (CAS) for final respondent submission.
     * Guarantees that concurrent submit requests cannot double-submit the same assessment.
     */
    claimAssessmentSubmissionAtomic(assessmentId: string, publicTokenHash: string, selectedLanguage: SupportedSocialStyleLanguage, completedAt?: Date): Promise<SocialStyleAssessmentRecord | null>;
    /**
     * Recoverable two-phase atomic claim for FIRST_EXPORT_ONLY billing.
     *
     * 1. First checks if a committed billable usage event ('FIRST_BILLABLE:<assessmentId>') already exists in the ledger.
     *    If so, reconciles the assessment lock state to 'COMMITTED' and returns { wonFirstExport: false }.
     * 2. Otherwise, atomically claims the assessment's firstBillableExportId in 'PENDING_LEDGER' state
     *    (including reclaiming stale 'PENDING_LEDGER' locks older than 30s if no ledger entry exists).
     */
    claimFirstBillableExportSlotAtomic(assessmentId: string, candidateEventId: string, now?: Date): Promise<{
        wonFirstExport: boolean;
    }>;
    /**
     * Commits the first-export lock after the usage ledger record is durably persisted.
     */
    commitFirstBillableExportSlot(assessmentId: string, eventId: string, exportedAt?: Date, incrementCounters?: boolean): Promise<void>;
    /**
     * Compensating rollback: releases a PENDING_LEDGER lock if usage-ledger insertion fails,
     * ensuring the assessment is NEVER permanently locked without a billable usage record.
     */
    releaseFirstBillableExportSlotOnFailure(assessmentId: string, candidateEventId: string): Promise<void>;
    incrementNonBillableExportCount(assessmentId: string, exportedAt?: Date, alsoIncrementBillable?: boolean): Promise<void>;
    listAssessments(filter: ListAssessmentsFilter): Promise<{
        data: SocialStyleAssessmentRecord[];
        total: number;
    }>;
    getAllAssessmentsForScope(consultantId?: string): Promise<SocialStyleAssessmentRecord[]>;
    findResponseByAssessmentId(assessmentId: string): Promise<SocialStyleResponseRecord | null>;
    saveDraftProgress(params: {
        assessmentId: string;
        consultantId: string;
        questionnaireVersion: string;
        selectedLanguage: SupportedSocialStyleLanguage;
        draftAnswers: ISocialStyleAnswerItem[];
        respondentUserAgent?: string;
    }): Promise<SocialStyleResponseRecord>;
    saveSubmittedResponse(params: {
        assessmentId: string;
        consultantId: string;
        questionnaireVersion: string;
        selectedLanguage: SupportedSocialStyleLanguage;
        answers: ISocialStyleAnswerItem[];
        submittedAt: Date;
        respondentUserAgent?: string;
    }): Promise<SocialStyleResponseRecord>;
    saveResult(record: Omit<SocialStyleResultRecord, 'createdAt' | 'updatedAt'>): Promise<SocialStyleResultRecord>;
    findResultByAssessmentId(assessmentId: string, consultantIdScope?: string): Promise<SocialStyleResultRecord | null>;
    saveReport(record: Omit<SocialStyleReportRecord, 'createdAt' | 'updatedAt'>): Promise<SocialStyleReportRecord>;
    deleteReportById(reportId: string): Promise<void>;
    findReportById(reportId: string, consultantIdScope?: string): Promise<SocialStyleReportRecord | null>;
    listReportsByAssessmentId(assessmentId: string, consultantIdScope?: string): Promise<SocialStyleReportRecord[]>;
    listReportsForConsultant(params: {
        consultantId?: string;
        assessmentId?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: SocialStyleReportRecord[];
        total: number;
    }>;
    findUsageEventByIdempotencyKey(idempotencyKey: string): Promise<SocialStyleUsageEventRecord | null>;
    findUsageEventByFirstExportLockKey(firstExportLockKey: string): Promise<SocialStyleUsageEventRecord | null>;
    recordUsageEvent(event: SocialStyleUsageEventRecord): Promise<SocialStyleUsageEventRecord>;
    listUsageEvents(filter: ListUsageEventsFilter): Promise<{
        data: SocialStyleUsageEventRecord[];
        total: number;
    }>;
    getAllUsageEventsMatching(filter: Omit<ListUsageEventsFilter, 'page' | 'limit'>): Promise<SocialStyleUsageEventRecord[]>;
    private buildUsageFilterQuery;
    private filterInMemoryUsageEvents;
    getInterpretationTemplates(version?: string): Promise<InterpretationTemplatesCatalog>;
    updateInterpretationTemplates(catalog: InterpretationTemplatesCatalog, updatedBy: string): Promise<InterpretationTemplatesCatalog>;
    getConsultantSettings(consultantId: string): Promise<SocialStyleConsultantSettingsRecord>;
    upsertConsultantSettings(consultantId: string, updates: Partial<Omit<SocialStyleConsultantSettingsRecord, 'consultantId' | 'createdAt' | 'updatedAt'>>, updatedBy: string): Promise<SocialStyleConsultantSettingsRecord>;
    createQrSession(record: Omit<SocialStyleQrSessionRecord, 'createdAt' | 'updatedAt'>): Promise<SocialStyleQrSessionRecord>;
    findQrSessionById(qrSessionId: string, consultantIdScope?: string): Promise<SocialStyleQrSessionRecord | null>;
    findQrSessionByTokenHash(sessionTokenHash: string): Promise<SocialStyleQrSessionRecord | null>;
    updateQrSession(qrSessionId: string, updates: Partial<SocialStyleQrSessionRecord>, consultantIdScope?: string): Promise<SocialStyleQrSessionRecord | null>;
    listQrSessions(consultantIdScope?: string): Promise<SocialStyleQrSessionRecord[]>;
    findAssessmentByQrSessionAndEmail(qrSessionId: string, participantEmail: string): Promise<SocialStyleAssessmentRecord | null>;
    claimQrSessionSeatAtomic(qrSessionId: string): Promise<SocialStyleQrSessionRecord | null>;
    private mapAssessmentDoc;
    private mapResponseDoc;
    private mapResultDoc;
    private mapReportDoc;
    private mapUsageEventDoc;
    private mapConsultantSettingsDoc;
    private mapQrSessionDoc;
}
