import { AuthenticatedUser } from '../../../../shared/presentation/middleware/auth.middleware';
import { AuditLogService } from '../../../audit-log/application/services/audit-log.service';
import { IStorageService } from '../../../../shared/infrastructure/storage/storage.service';
import { SupportedSocialStyleLanguage } from '../../domain/constants/answer-key-v1.definition';
import { InterpretationTemplatesCatalog } from '../../domain/constants/style-interpretations.definition';
import { SocialStyleScoringService } from '../../domain/services/social-style-scoring.service';
import { SocialStyleGraphService } from '../../domain/services/social-style-graph.service';
import { SocialStyleTokenService } from '../../domain/services/social-style-token.service';
import { ListAssessmentsFilter, ListUsageEventsFilter, SocialStyleReportRecord, SocialStyleUsageEventRecord, SocialStylesRepository } from '../../infrastructure/persistence/mongoose/social-styles.repository';
import { NonBillableReason, SocialStyleQrSessionStatus, SocialStyleUsageCategory } from '../../infrastructure/persistence/mongoose/social-styles.schemas';
import { SocialStylePdfGenerator } from '../../infrastructure/generators/social-style-pdf.generator';
export interface ExportReportServiceResult {
    report: SocialStyleReportRecord;
    usageEvent: SocialStyleUsageEventRecord;
    pdfBuffer: Buffer;
}
/**
 * Core Application Service orchestrating the Social Styles Assessment bounded context.
 * Enforces RBAC, strict consultant isolation, public token security, recoverable FIRST_EXPORT_ONLY
 * usage accounting, and backward-compatible module-level audit logging.
 */
export declare class SocialStylesApplicationService {
    private readonly repository;
    private readonly scoringService;
    private readonly graphService;
    private readonly tokenService;
    private readonly pdfGenerator;
    private readonly storageService;
    private readonly auditLogService;
    constructor(repository?: SocialStylesRepository, scoringService?: SocialStyleScoringService, graphService?: SocialStyleGraphService, tokenService?: SocialStyleTokenService, pdfGenerator?: SocialStylePdfGenerator, storageService?: IStorageService, auditLogService?: AuditLogService);
    getRepository(): SocialStylesRepository;
    getPdfGenerator(): SocialStylePdfGenerator;
    private isSuperAdmin;
    private isAllowedConsultantOrAdmin;
    assertConsultantModuleAccess(actor: AuthenticatedUser): Promise<void>;
    private resolveConsultantScope;
    private getAuthorizedAssessmentOrThrow;
    createAssessment(actor: AuthenticatedUser, input: {
        participantName: string;
        participantEmail: string;
        participantPhone?: string;
        organizationName?: string;
        organizationId?: string;
        participantId?: string;
        title?: string;
        reference?: string;
        consultantNotes?: string;
        language?: SupportedSocialStyleLanguage;
        tokenExpiresAt?: string;
        generatePublicLinkNow?: boolean;
    }, clientIp?: string): Promise<{
        assessment: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        };
    }>;
    getAssessmentDetails(actor: AuthenticatedUser, assessmentId: string): Promise<{
        assessment: {
            progress: {
                answeredCount: number;
                totalQuestions: number;
                lastSavedAt: string | null;
            };
            reports: {
                reportId: string;
                reportVersion: string;
                language: SupportedSocialStyleLanguage;
                fileName: string;
                fileSizeBytes: number;
                checksumSha256: string;
                billable: boolean;
                generatedAt: string;
            }[];
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        };
    }>;
    listAssessments(actor: AuthenticatedUser, query: ListAssessmentsFilter): Promise<{
        data: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateAssessment(actor: AuthenticatedUser, assessmentId: string, updates: {
        participantName?: string;
        participantEmail?: string;
        participantPhone?: string | null;
        organizationName?: string | null;
        title?: string;
        reference?: string | null;
        consultantNotes?: string | null;
        language?: SupportedSocialStyleLanguage;
        tokenExpiresAt?: string | null;
    }, clientIp?: string): Promise<{
        assessment: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        };
    }>;
    generatePublicLink(actor: AuthenticatedUser, assessmentId: string, tokenExpiresAtInput?: string, clientIp?: string): Promise<{
        assessmentId: string;
        status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
        publicUrl: string;
        tokenExpiresAt: string | null;
        invitedAt: string;
    }>;
    revokePublicLink(actor: AuthenticatedUser, assessmentId: string, clientIp?: string): Promise<{
        assessmentId: string;
        status: string;
        tokenRevokedAt: string;
    }>;
    reopenAssessment(actor: AuthenticatedUser, assessmentId: string, options?: {
        reason?: string;
        tokenExpiresAt?: string;
    }, clientIp?: string): Promise<{
        assessmentId: string;
        status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
        publicUrl: string;
        tokenExpiresAt: string | null;
    }>;
    getAssessmentResults(actor: AuthenticatedUser, assessmentId: string, requestedLanguage?: SupportedSocialStyleLanguage, clientIp?: string): Promise<{
        assessment: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        };
        result: {
            resultId: string;
            questionnaireVersion: string;
            scoringVersion: string;
            graphVersion: string;
            calculatedAt: string;
            rawScores: import("../../domain/services/social-style-scoring.service").SocialStyleRawScores;
            finalScores: import("../../domain/services/social-style-scoring.service").SocialStyleFinalScores;
            fourAxisProfile: import("../../domain/services/social-style-graph.service").FourAxisProfileData;
            netBalanceCoordinate: import("../../domain/services/social-style-graph.service").NetBalanceCoordinateData;
            highestScoredStyles: import("../../domain/constants/answer-key-v1.definition").SocialStyleType[];
            answerBreakdown: {
                questionNumber: number;
                selectedOption: import("../../domain/constants/answer-key-v1.definition").AnswerOptionCode;
                optionLabel: string;
                optionLabelEn: string;
                mappedStyle: import("../../domain/constants/answer-key-v1.definition").SocialStyleType;
            }[];
        };
        interpretation: {
            version: string;
            contentStatus: import("../../domain/constants/style-interpretations.definition").InterpretationContentStatus;
            language: SupportedSocialStyleLanguage;
            translationStatus: import("../../domain/constants/questionnaire-v1.definition").TranslationReviewStatus;
            disclaimer: string;
            fourAxisExplanation: string;
            netCoordinateExplanation: string;
            orderedStyleGuidance: (import("../../domain/constants/style-interpretations.definition").StyleGuidanceContent & {
                finalScore: number;
                isHighestScored: boolean;
            })[];
        };
    }>;
    private resolveValidPublicAssessmentOrThrow;
    getPublicQuestionnaireSession(rawToken: string): Promise<{
        assessment: {
            assessmentId: string;
            title: string;
            reference: string | null;
            participantName: string;
            organizationName: string | null;
            consultantName: string;
            firmName: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            selectedLanguage: SupportedSocialStyleLanguage;
            supportedLanguages: SupportedSocialStyleLanguage[];
            tokenExpiresAt: string | null;
        };
        questionnaire: {
            version: string;
            supportedLanguages: SupportedSocialStyleLanguage[];
            translationMetadata: Record<SupportedSocialStyleLanguage, import("../../domain/constants/questionnaire-v1.definition").TranslationLanguageMetadata>;
            instructions: {
                en: string;
                si: string;
                ta: string;
            };
            questions: {
                questionNumber: number;
                options: {
                    code: import("../../domain/constants/answer-key-v1.definition").AnswerOptionCode;
                    labels: {
                        en: string;
                        si: string;
                        ta: string;
                    };
                }[];
            }[];
        };
        draftProgress: {
            selectedLanguage: SupportedSocialStyleLanguage;
            draftAnswers: import("../../infrastructure/persistence/mongoose/social-styles.schemas").ISocialStyleAnswerItem[];
            lastSavedAt: string | null;
        };
    }>;
    startPublicAssessment(rawToken: string, language?: SupportedSocialStyleLanguage, clientIp?: string): Promise<{
        status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
        startedAt: string;
        selectedLanguage: SupportedSocialStyleLanguage;
    }>;
    savePublicProgress(rawToken: string, input: {
        selectedLanguage?: SupportedSocialStyleLanguage;
        draftAnswers: Array<{
            questionNumber: number;
            selectedOption: 'A' | 'B' | 'C' | 'D';
        }>;
    }, userAgent?: string): Promise<{
        status: string;
        answeredCount: number;
        totalQuestions: number;
        selectedLanguage: SupportedSocialStyleLanguage;
        lastSavedAt: string;
    }>;
    submitPublicAssessment(rawToken: string, input: {
        selectedLanguage?: SupportedSocialStyleLanguage;
        answers: Array<{
            questionNumber: number;
            selectedOption: string;
        }>;
    }, clientIp?: string, userAgent?: string): Promise<{
        status: string;
        assessmentId: string;
        submittedAt: string;
        selectedLanguage: SupportedSocialStyleLanguage;
        confirmationMessage: string;
    }>;
    exportAssessmentReport(actor: AuthenticatedUser, assessmentId: string, options?: {
        language?: SupportedSocialStyleLanguage;
        idempotencyKey?: string;
    }, clientIp?: string): Promise<ExportReportServiceResult>;
    downloadExistingReport(actor: AuthenticatedUser, reportId: string, clientIp?: string): Promise<ExportReportServiceResult>;
    getConsultantDashboard(actor: AuthenticatedUser, requestedConsultantId?: string): Promise<{
        kpis: {
            totalAssessments: number;
            draftCount: number;
            pendingInvitedCount: number;
            inProgressCount: number;
            completedCount: number;
            reviewedCount: number;
            expiredOrRevokedCount: number;
            totalReportsExported: number;
            billableReportsTotal: number;
            billableReportsThisMonth: number;
            monthlyReportQuota: number | null | undefined;
            remainingMonthlyQuota: number | null;
            chargingPolicy: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
            moduleEnabled: boolean;
        };
        recentAssessments: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        }[];
    }>;
    getConsultantReports(actor: AuthenticatedUser, params: {
        assessmentId?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: {
            reportId: string;
            assessmentId: string;
            consultantId: string;
            reportVersion: string;
            language: SupportedSocialStyleLanguage;
            fileName: string;
            fileSizeBytes: number;
            checksumSha256: string;
            billable: boolean;
            generatedAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getConsultantUsage(actor: AuthenticatedUser, filter: ListUsageEventsFilter): Promise<{
        summary: {
            consultantId: string;
            chargingPolicy: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
            currentMonthPeriod: string;
            billableExportsToday: number;
            billableExportsCurrentMonth: number;
            billableExportsCurrentQuarter: number;
            billableExportsLifetime: number;
            nonBillableReExportsLifetime: number;
            monthlyReportQuota: number | null | undefined;
            remainingMonthlyQuota: number | null;
        };
        monthlyBreakdown: {
            billingPeriod: string;
            billableCount: number;
            nonBillableCount: number;
            totalExports: number;
        }[];
        events: {
            data: {
                eventId: string;
                consultantId: string;
                consultantName: string;
                consultantEmail: string | null;
                firmId: string | null;
                firmName: string | null;
                organizationId: string | null;
                organizationName: string | null;
                assessmentId: string;
                participantName: string;
                reportId: string;
                eventType: "REPORT_EXPORTED" | "REPORT_REDOWNLOADED";
                usageCategory: SocialStyleUsageCategory;
                chargingPolicyApplied: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
                billable: boolean;
                nonBillableReason: NonBillableReason | null;
                exportFormat: "PDF";
                reportVersion: string;
                language: SupportedSocialStyleLanguage;
                billingPeriod: string;
                billingQuarter: string;
                billingYear: number;
                triggeredByUserId: string;
                triggeredByRole: string;
                createdAt: string;
            }[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    private assertSuperAdmin;
    getSuperAdminDashboard(actor: AuthenticatedUser, filter?: {
        startDate?: Date;
        endDate?: Date;
        firmId?: string;
    }): Promise<{
        metrics: {
            totalRegisteredConsultants: number;
            activeConsultantsWithUsage: number;
            suspendedConsultantsCount: number;
            totalAssessmentsCreated: number;
            totalAssessmentsCompleted: number;
            totalBillableReportsExported: number;
            totalNonBillableExports: number;
            billableReportsToday: number;
            billableReportsThisMonth: number;
            billableReportsThisQuarter: number;
            billableReportsThisYear: number;
            topConsultant: {
                consultantId: string;
                consultantName: string;
                firmName: string | null;
                billableReportsCount: number;
            } | null;
        };
        monthlyTrend: {
            billingPeriod: string;
            billableCount: number;
            nonBillableCount: number;
        }[];
    }>;
    getSuperAdminConsultantsTable(actor: AuthenticatedUser, params: {
        search?: string;
        firmId?: string;
        status?: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'APPROACHING_QUOTA';
        startDate?: Date;
        endDate?: Date;
        page: number;
        limit: number;
    }): Promise<{
        data: {
            consultantId: string;
            consultantName: string;
            consultantEmail: string;
            role: string;
            firmId: string | null;
            firmName: string | null;
            assessmentsCreated: number;
            assessmentsCompleted: number;
            billableReportsExported: number;
            nonBillableReportsExported: number;
            currentMonthBillable: number;
            currentQuarterBillable: number;
            lifetimeBillableUsage: number;
            chargingPolicy: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
            monthlyReportQuota: number | null | undefined;
            lifetimeReportQuota: number | null | undefined;
            quotaUtilizationPercent: number | null;
            isApproachingQuota: boolean;
            moduleEnabled: boolean;
            suspensionReason: string | null | undefined;
            lastExportAt: string | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSuperAdminUsageAnalytics(actor: AuthenticatedUser, filter: ListUsageEventsFilter & {
        format?: 'json' | 'csv';
    }): Promise<{
        csv: string;
        fileName: string;
        summary?: undefined;
        data?: undefined;
        pagination?: undefined;
    } | {
        summary: {
            totalEventsMatching: number;
            billableCount: number;
            nonBillableCount: number;
        };
        data: {
            eventId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            assessmentId: string;
            participantName: string;
            reportId: string;
            eventType: "REPORT_EXPORTED" | "REPORT_REDOWNLOADED";
            usageCategory: SocialStyleUsageCategory;
            chargingPolicyApplied: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
            billable: boolean;
            nonBillableReason: NonBillableReason | null;
            exportFormat: "PDF";
            reportVersion: string;
            language: SupportedSocialStyleLanguage;
            billingPeriod: string;
            billingQuarter: string;
            billingYear: number;
            triggeredByUserId: string;
            triggeredByRole: string;
            createdAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        csv?: undefined;
        fileName?: undefined;
    }>;
    getSuperAdminConsultantDetail(actor: AuthenticatedUser, consultantId: string, page?: number, limit?: number): Promise<{
        consultantId: string;
        settings: import("../../infrastructure/persistence/mongoose/social-styles.repository").SocialStyleConsultantSettingsRecord;
        usage: {
            summary: {
                consultantId: string;
                chargingPolicy: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
                currentMonthPeriod: string;
                billableExportsToday: number;
                billableExportsCurrentMonth: number;
                billableExportsCurrentQuarter: number;
                billableExportsLifetime: number;
                nonBillableReExportsLifetime: number;
                monthlyReportQuota: number | null | undefined;
                remainingMonthlyQuota: number | null;
            };
            monthlyBreakdown: {
                billingPeriod: string;
                billableCount: number;
                nonBillableCount: number;
                totalExports: number;
            }[];
            events: {
                data: {
                    eventId: string;
                    consultantId: string;
                    consultantName: string;
                    consultantEmail: string | null;
                    firmId: string | null;
                    firmName: string | null;
                    organizationId: string | null;
                    organizationName: string | null;
                    assessmentId: string;
                    participantName: string;
                    reportId: string;
                    eventType: "REPORT_EXPORTED" | "REPORT_REDOWNLOADED";
                    usageCategory: SocialStyleUsageCategory;
                    chargingPolicyApplied: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleChargingPolicy;
                    billable: boolean;
                    nonBillableReason: NonBillableReason | null;
                    exportFormat: "PDF";
                    reportVersion: string;
                    language: SupportedSocialStyleLanguage;
                    billingPeriod: string;
                    billingQuarter: string;
                    billingYear: number;
                    triggeredByUserId: string;
                    triggeredByRole: string;
                    createdAt: string;
                }[];
                pagination: {
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                };
            };
        };
        recentAssessments: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        }[];
    }>;
    updateConsultantAccess(actor: AuthenticatedUser, consultantId: string, updates: {
        moduleEnabled?: boolean;
        suspensionReason?: string | null;
        chargingPolicy?: 'FIRST_EXPORT_ONLY' | 'EVERY_EXPORT' | 'QUOTA_CREDIT';
        monthlyReportQuota?: number | null;
        lifetimeReportQuota?: number | null;
        prepaidCreditsBalance?: number;
    }, clientIp?: string): Promise<{
        settings: import("../../infrastructure/persistence/mongoose/social-styles.repository").SocialStyleConsultantSettingsRecord;
    }>;
    updateInterpretationTemplates(actor: AuthenticatedUser, catalog: InterpretationTemplatesCatalog, clientIp?: string): Promise<{
        interpretationTemplates: InterpretationTemplatesCatalog;
    }>;
    getInterpretationTemplates(actor: AuthenticatedUser): Promise<{
        interpretationTemplates: InterpretationTemplatesCatalog;
    }>;
    bulkCreateAssessments(actor: AuthenticatedUser, input: {
        title?: string;
        organizationName?: string;
        organizationId?: string;
        reference?: string;
        consultantNotes?: string;
        language?: SupportedSocialStyleLanguage;
        tokenExpiresAt?: string;
        sendInvitationEmails?: boolean;
        sendEmailInvitations?: boolean;
        participants: Array<{
            participantName: string;
            participantEmail: string;
            participantPhone?: string;
            organizationName?: string;
            reference?: string;
            language?: SupportedSocialStyleLanguage;
            consultantNotes?: string;
        }>;
    }, clientIp?: string): Promise<{
        batchId: string;
        summary: {
            totalSubmitted: number;
            createdCount: number;
            skippedDuplicates: number;
            emailsSent: number;
            emailsFailed: number;
        };
        results: {
            rowIndex: number;
            participantName: string;
            participantEmail: string;
            participantPhone?: string;
            organizationName?: string;
            status: "CREATED" | "SKIPPED_DUPLICATE_IN_BATCH";
            assessmentId?: string;
            publicUrl?: string;
            emailDispatched: boolean;
            emailProvider?: string;
            emailError?: string;
        }[];
    }>;
    sendAssessmentInvitationEmail(actor: AuthenticatedUser, assessmentId: string, clientIp?: string): Promise<{
        assessmentId: string;
        recipientEmail: string;
        publicUrl: string;
        emailDispatched: boolean;
        provider: string;
        errorMessage: string | undefined;
        invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
        invitationEmailSentAt: string | null;
    }>;
    createQrSession(actor: AuthenticatedUser, input: {
        title?: string;
        organizationName?: string;
        organizationId?: string;
        reference?: string;
        consultantNotes?: string;
        language?: SupportedSocialStyleLanguage;
        assessmentLinkExpiryDays?: number;
        expiresAt?: string | null;
        maxParticipants?: number | null;
        requirePhone?: boolean;
        sendBackupEmail?: boolean;
    }, clientIp?: string): Promise<{
        qrSession: {
            qrSessionId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: SocialStyleQrSessionStatus;
            publicJoinUrl: string | null;
            expiresAt: string | null;
            assessmentLinkExpiryDays: number;
            maxParticipants: number | null;
            registeredCount: number;
            completedCount: number;
            requirePhone: boolean;
            sendBackupEmail: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    listQrSessions(actor: AuthenticatedUser, requestedConsultantId?: string): Promise<{
        data: {
            qrSessionId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: SocialStyleQrSessionStatus;
            publicJoinUrl: string | null;
            expiresAt: string | null;
            assessmentLinkExpiryDays: number;
            maxParticipants: number | null;
            registeredCount: number;
            completedCount: number;
            requirePhone: boolean;
            sendBackupEmail: boolean;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    getQrSessionDetails(actor: AuthenticatedUser, qrSessionId: string): Promise<{
        qrSession: {
            qrSessionId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: SocialStyleQrSessionStatus;
            publicJoinUrl: string | null;
            expiresAt: string | null;
            assessmentLinkExpiryDays: number;
            maxParticipants: number | null;
            registeredCount: number;
            completedCount: number;
            requirePhone: boolean;
            sendBackupEmail: boolean;
            createdAt: string;
            updatedAt: string;
        };
        participants: {
            tokenExpiresAt: string | null;
            tokenRevokedAt: string | null;
            invitedAt: string | null;
            startedAt: string | null;
            completedAt: string | null;
            reviewedAt: string | null;
            firstExportedAt: string | null;
            lastReportExportedAt: string | null;
            reportExportCount: number;
            billableExportCount: number;
            createdAt: string;
            updatedAt: string;
            publicUrl?: string | undefined;
            assessmentId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            participantId: string | null;
            participantName: string;
            participantEmail: string;
            participantPhone: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentStatus;
            sourceChannel: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleAssessmentSourceChannel;
            batchId: string | null;
            qrSessionId: string | null;
            invitationEmailStatus: import("../../infrastructure/persistence/mongoose/social-styles.schemas").SocialStyleInvitationEmailStatus;
            invitationEmailSentAt: string | null;
            invitationEmailError: string | null;
            hasActivePublicLink: boolean;
        }[];
    }>;
    updateQrSession(actor: AuthenticatedUser, qrSessionId: string, updates: {
        title?: string;
        organizationName?: string | null;
        reference?: string | null;
        consultantNotes?: string | null;
        language?: SupportedSocialStyleLanguage;
        status?: SocialStyleQrSessionStatus;
        assessmentLinkExpiryDays?: number;
        expiresAt?: string | null;
        maxParticipants?: number | null;
        requirePhone?: boolean;
        sendBackupEmail?: boolean;
    }, clientIp?: string): Promise<{
        qrSession: {
            qrSessionId: string;
            consultantId: string;
            consultantName: string;
            consultantEmail: string | null;
            firmId: string | null;
            firmName: string | null;
            organizationId: string | null;
            organizationName: string | null;
            title: string;
            reference: string | null;
            consultantNotes: string | null;
            language: SupportedSocialStyleLanguage;
            questionnaireVersion: string;
            status: SocialStyleQrSessionStatus;
            publicJoinUrl: string | null;
            expiresAt: string | null;
            assessmentLinkExpiryDays: number;
            maxParticipants: number | null;
            registeredCount: number;
            completedCount: number;
            requirePhone: boolean;
            sendBackupEmail: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    private resolveValidPublicQrSessionOrThrow;
    getPublicQrSession(rawSessionToken: string): Promise<{
        qrSession: {
            qrSessionId: string;
            title: string;
            reference: string | null;
            organizationName: string | null;
            consultantName: string;
            firmName: string;
            defaultLanguage: SupportedSocialStyleLanguage;
            supportedLanguages: SupportedSocialStyleLanguage[];
            requirePhone: boolean;
            isFull: boolean;
            maxParticipants: number | null;
            registeredCount: number;
            expiresAt: string | null;
            status: SocialStyleQrSessionStatus;
        };
    }>;
    registerParticipantViaQrSession(rawSessionToken: string, input: {
        participantName: string;
        participantEmail: string;
        participantPhone?: string;
        selectedLanguage?: SupportedSocialStyleLanguage;
    }, clientIp?: string): Promise<{
        resumedExisting: boolean;
        assessmentId: string;
        publicToken: string;
        publicUrl: string;
        selectedLanguage: SupportedSocialStyleLanguage;
    }>;
    private formatQrSessionResponse;
    private formatConsultantAssessmentResponse;
    private formatUsageEventResponse;
    private recordModuleAudit;
}
