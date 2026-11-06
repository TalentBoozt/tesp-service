"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStylesApplicationService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const audit_log_service_1 = require("../../../audit-log/application/services/audit-log.service");
const storage_service_1 = require("../../../../shared/infrastructure/storage/storage.service");
const user_schema_1 = require("../../../auth/infrastructure/persistence/user.schema");
const consulting_firm_schema_1 = require("../../../consultant/infrastructure/persistence/mongoose/consulting-firm.schema");
const answer_key_v1_definition_1 = require("../../domain/constants/answer-key-v1.definition");
const questionnaire_v1_definition_1 = require("../../domain/constants/questionnaire-v1.definition");
const style_interpretations_definition_1 = require("../../domain/constants/style-interpretations.definition");
const social_style_scoring_service_1 = require("../../domain/services/social-style-scoring.service");
const social_style_graph_service_1 = require("../../domain/services/social-style-graph.service");
const social_style_token_service_1 = require("../../domain/services/social-style-token.service");
const social_styles_repository_1 = require("../../infrastructure/persistence/mongoose/social-styles.repository");
const social_styles_schemas_1 = require("../../infrastructure/persistence/mongoose/social-styles.schemas");
const social_style_pdf_generator_1 = require("../../infrastructure/generators/social-style-pdf.generator");
/**
 * Core Application Service orchestrating the Social Styles Assessment bounded context.
 * Enforces RBAC, strict consultant isolation, public token security, recoverable FIRST_EXPORT_ONLY
 * usage accounting, and backward-compatible module-level audit logging.
 */
class SocialStylesApplicationService {
    repository;
    scoringService;
    graphService;
    tokenService;
    pdfGenerator;
    storageService;
    auditLogService;
    constructor(repository = new social_styles_repository_1.SocialStylesRepository(), scoringService = new social_style_scoring_service_1.SocialStyleScoringService(), graphService = new social_style_graph_service_1.SocialStyleGraphService(), tokenService = new social_style_token_service_1.SocialStyleTokenService(), pdfGenerator = new social_style_pdf_generator_1.SocialStylePdfGenerator(), storageService = storage_service_1.StorageService.getInstance(), auditLogService = audit_log_service_1.AuditLogService.getInstance()) {
        this.repository = repository;
        this.scoringService = scoringService;
        this.graphService = graphService;
        this.tokenService = tokenService;
        this.pdfGenerator = pdfGenerator;
        this.storageService = storageService;
        this.auditLogService = auditLogService;
    }
    getRepository() {
        return this.repository;
    }
    getPdfGenerator() {
        return this.pdfGenerator;
    }
    // ==========================================================================
    // Authorization & Guard Helpers
    // ==========================================================================
    isSuperAdmin(actor) {
        return actor.role === auth_middleware_1.UserRole.SUPER_ADMIN;
    }
    isAllowedConsultantOrAdmin(actor) {
        return [
            auth_middleware_1.UserRole.SUPER_ADMIN,
            auth_middleware_1.UserRole.CONSULTANT,
            auth_middleware_1.UserRole.CONSULTANT_DAASH,
        ].includes(actor.role);
    }
    async assertConsultantModuleAccess(actor) {
        if (!this.isAllowedConsultantOrAdmin(actor)) {
            throw new error_middleware_1.AppError(403, 'You do not have permission to access the Social Styles module.', 'https://tesp-api.talnova.io/errors/social-styles/forbidden');
        }
        if (!this.isSuperAdmin(actor)) {
            const settings = await this.repository.getConsultantSettings(actor.userId);
            if (!settings.moduleEnabled) {
                throw new error_middleware_1.AppError(403, settings.suspensionReason
                    ? `Social Styles access is suspended: ${settings.suspensionReason}`
                    : 'Your access to the Social Styles Assessment module has been suspended by an administrator.', 'https://tesp-api.talnova.io/errors/social-styles/consultant-suspended');
            }
        }
    }
    resolveConsultantScope(actor, requestedConsultantId) {
        if (this.isSuperAdmin(actor)) {
            return requestedConsultantId || undefined;
        }
        return actor.userId;
    }
    async getAuthorizedAssessmentOrThrow(actor, assessmentId) {
        const scope = this.isSuperAdmin(actor) ? undefined : actor.userId;
        const assessment = await this.repository.findAssessmentById(assessmentId, scope);
        if (!assessment) {
            throw new error_middleware_1.AppError(404, `Social Styles assessment '${assessmentId}' was not found or you do not have access.`, 'https://tesp-api.talnova.io/errors/social-styles/assessment-not-found');
        }
        return assessment;
    }
    // ==========================================================================
    // 1. Consultant Workspace & Assessment Lifecycle
    // ==========================================================================
    async createAssessment(actor, input, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        const assessmentId = `SSA-${datePart}-${randomSuffix}`;
        let expiresAt;
        if (input.tokenExpiresAt) {
            expiresAt = new Date(input.tokenExpiresAt);
            if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
                throw new error_middleware_1.AppError(400, 'tokenExpiresAt must be a valid future timestamp.', 'https://tesp-api.talnova.io/errors/social-styles/invalid-expiry');
            }
        }
        const generateNow = input.generatePublicLinkNow !== false;
        const tokenBundle = generateNow ? this.tokenService.generateTokenBundle(expiresAt) : null;
        const record = await this.repository.createAssessment({
            assessmentId,
            consultantId: actor.userId,
            consultantName: actor.name || actor.email || actor.userId,
            consultantEmail: actor.email,
            firmId: actor.firmId,
            firmName: actor.firmName,
            organizationId: input.organizationId,
            organizationName: input.organizationName,
            participantId: input.participantId,
            participantName: input.participantName,
            participantEmail: input.participantEmail.toLowerCase(),
            participantPhone: input.participantPhone,
            title: input.title || 'Social Styles Assessment',
            reference: input.reference,
            consultantNotes: input.consultantNotes,
            language: input.language || 'en',
            questionnaireVersion: answer_key_v1_definition_1.CURRENT_QUESTIONNAIRE_VERSION,
            status: tokenBundle ? 'INVITED' : 'DRAFT',
            publicTokenHash: tokenBundle?.publicTokenHash,
            encryptedPublicToken: tokenBundle?.encryptedPublicToken || null,
            tokenExpiresAt: expiresAt || null,
            tokenRevokedAt: null,
            invitedAt: tokenBundle ? now : null,
            startedAt: null,
            completedAt: null,
            reviewedAt: null,
            firstBillableExportId: null,
            firstBillableLockState: 'NONE',
            firstBillableLockedAt: null,
            firstExportedAt: null,
            lastReportExportedAt: null,
            reportExportCount: 0,
            billableExportCount: 0,
            createdBy: actor.userId,
        });
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_ASSESSMENT_CREATED',
            resourceType: 'ASSESSMENT',
            resourceId: record.assessmentId,
            firmId: record.firmId,
            organizationId: record.organizationId,
            ipAddress: clientIp,
            metadata: {
                status: record.status,
                language: record.language,
                hasPublicLink: Boolean(tokenBundle),
            },
        });
        return {
            assessment: this.formatConsultantAssessmentResponse(record, tokenBundle?.publicUrl || null),
        };
    }
    async getAssessmentDetails(actor, assessmentId) {
        await this.assertConsultantModuleAccess(actor);
        const assessment = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        const [response, reports] = await Promise.all([
            this.repository.findResponseByAssessmentId(assessmentId),
            this.repository.listReportsByAssessmentId(assessmentId),
        ]);
        const activePublicUrl = ['INVITED', 'IN_PROGRESS', 'REOPENED'].includes(assessment.status)
            ? this.tokenService.reconstructPublicUrlFromEncrypted(assessment.encryptedPublicToken)
            : null;
        return {
            assessment: {
                ...this.formatConsultantAssessmentResponse(assessment, activePublicUrl),
                progress: {
                    answeredCount: response
                        ? response.isSubmitted
                            ? response.answers.length
                            : response.draftAnswers.length
                        : 0,
                    totalQuestions: 20,
                    lastSavedAt: response?.lastSavedAt ? response.lastSavedAt.toISOString() : null,
                },
                reports: reports.map((r) => ({
                    reportId: r.reportId,
                    reportVersion: r.reportVersion,
                    language: r.language,
                    fileName: r.fileName,
                    fileSizeBytes: r.fileSizeBytes,
                    checksumSha256: r.checksumSha256,
                    billable: r.billable,
                    generatedAt: r.generatedAt.toISOString(),
                })),
            },
        };
    }
    async listAssessments(actor, query) {
        await this.assertConsultantModuleAccess(actor);
        const consultantScope = this.resolveConsultantScope(actor, query.consultantId);
        const { data, total } = await this.repository.listAssessments({
            ...query,
            consultantId: consultantScope,
        });
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        return {
            data: data.map((item) => {
                const activeUrl = ['INVITED', 'IN_PROGRESS', 'REOPENED'].includes(item.status)
                    ? this.tokenService.reconstructPublicUrlFromEncrypted(item.encryptedPublicToken)
                    : null;
                return this.formatConsultantAssessmentResponse(item, activeUrl);
            }),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async updateAssessment(actor, assessmentId, updates, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const existing = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        const patch = {};
        if (updates.participantName !== undefined)
            patch.participantName = updates.participantName;
        if (updates.participantEmail !== undefined)
            patch.participantEmail = updates.participantEmail.toLowerCase();
        if (updates.participantPhone !== undefined)
            patch.participantPhone = updates.participantPhone || undefined;
        if (updates.organizationName !== undefined)
            patch.organizationName = updates.organizationName || undefined;
        if (updates.title !== undefined)
            patch.title = updates.title;
        if (updates.reference !== undefined)
            patch.reference = updates.reference || undefined;
        if (updates.consultantNotes !== undefined)
            patch.consultantNotes = updates.consultantNotes || undefined;
        if (updates.language !== undefined)
            patch.language = updates.language;
        if (updates.tokenExpiresAt !== undefined) {
            if (updates.tokenExpiresAt === null) {
                patch.tokenExpiresAt = null;
            }
            else {
                const exp = new Date(updates.tokenExpiresAt);
                if (Number.isNaN(exp.getTime()) || exp.getTime() <= Date.now()) {
                    throw new error_middleware_1.AppError(400, 'tokenExpiresAt must be a future timestamp.', 'https://tesp-api.talnova.io/errors/social-styles/invalid-expiry');
                }
                patch.tokenExpiresAt = exp;
            }
        }
        const updated = await this.repository.updateAssessment(assessmentId, patch);
        if (!updated) {
            throw new error_middleware_1.AppError(404, 'Assessment not found.');
        }
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_ASSESSMENT_UPDATED',
            resourceType: 'ASSESSMENT',
            resourceId: assessmentId,
            firmId: existing.firmId,
            organizationId: existing.organizationId,
            ipAddress: clientIp,
            metadata: { updatedFields: Object.keys(patch) },
        });
        const activeUrl = ['INVITED', 'IN_PROGRESS', 'REOPENED'].includes(updated.status)
            ? this.tokenService.reconstructPublicUrlFromEncrypted(updated.encryptedPublicToken)
            : null;
        return {
            assessment: this.formatConsultantAssessmentResponse(updated, activeUrl),
        };
    }
    async generatePublicLink(actor, assessmentId, tokenExpiresAtInput, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const existing = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        if (existing.status === 'COMPLETED' || existing.status === 'REVIEWED') {
            throw new error_middleware_1.AppError(409, 'Cannot generate a new public link for an already completed assessment.', 'https://tesp-api.talnova.io/errors/social-styles/assessment-already-completed');
        }
        let expiresAt = existing.tokenExpiresAt || undefined;
        if (tokenExpiresAtInput) {
            expiresAt = new Date(tokenExpiresAtInput);
            if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
                throw new error_middleware_1.AppError(400, 'tokenExpiresAt must be a future timestamp.', 'https://tesp-api.talnova.io/errors/social-styles/invalid-expiry');
            }
        }
        const now = new Date();
        const bundle = this.tokenService.generateTokenBundle(expiresAt);
        const nextStatus = existing.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'INVITED';
        const updated = await this.repository.updateAssessment(assessmentId, {
            status: nextStatus,
            publicTokenHash: bundle.publicTokenHash,
            encryptedPublicToken: bundle.encryptedPublicToken,
            tokenExpiresAt: expiresAt || null,
            tokenRevokedAt: null,
            invitedAt: now,
        });
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_LINK_GENERATED',
            resourceType: 'ASSESSMENT',
            resourceId: assessmentId,
            firmId: existing.firmId,
            organizationId: existing.organizationId,
            ipAddress: clientIp,
            metadata: {
                status: nextStatus,
                tokenExpiresAt: expiresAt ? expiresAt.toISOString() : null,
            },
        });
        return {
            assessmentId,
            status: updated.status,
            publicUrl: bundle.publicUrl,
            tokenExpiresAt: expiresAt ? expiresAt.toISOString() : null,
            invitedAt: now.toISOString(),
        };
    }
    async revokePublicLink(actor, assessmentId, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const existing = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        if (existing.status === 'COMPLETED' || existing.status === 'REVIEWED') {
            throw new error_middleware_1.AppError(409, 'Cannot revoke public link because the assessment is already completed.', 'https://tesp-api.talnova.io/errors/social-styles/assessment-already-completed');
        }
        const now = new Date();
        await this.repository.updateAssessment(assessmentId, {
            status: 'REVOKED',
            publicTokenHash: undefined,
            encryptedPublicToken: null,
            tokenRevokedAt: now,
        });
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_LINK_REVOKED',
            resourceType: 'ASSESSMENT',
            resourceId: assessmentId,
            firmId: existing.firmId,
            organizationId: existing.organizationId,
            ipAddress: clientIp,
            metadata: { revokedAt: now.toISOString() },
        });
        return {
            assessmentId,
            status: 'REVOKED',
            tokenRevokedAt: now.toISOString(),
        };
    }
    async reopenAssessment(actor, assessmentId, options, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const existing = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        if (!['EXPIRED', 'REVOKED', 'CANCELLED'].includes(existing.status)) {
            throw new error_middleware_1.AppError(409, `Only EXPIRED, REVOKED, or CANCELLED assessments can be reopened (current status: ${existing.status}).`, 'https://tesp-api.talnova.io/errors/social-styles/invalid-status-transition');
        }
        let expiresAt;
        if (options?.tokenExpiresAt) {
            expiresAt = new Date(options.tokenExpiresAt);
            if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
                throw new error_middleware_1.AppError(400, 'tokenExpiresAt must be a future timestamp.');
            }
        }
        const now = new Date();
        const bundle = this.tokenService.generateTokenBundle(expiresAt);
        const updated = await this.repository.updateAssessment(assessmentId, {
            status: 'REOPENED',
            publicTokenHash: bundle.publicTokenHash,
            encryptedPublicToken: bundle.encryptedPublicToken,
            tokenExpiresAt: expiresAt || null,
            tokenRevokedAt: null,
            invitedAt: now,
        });
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_ASSESSMENT_REOPENED',
            resourceType: 'ASSESSMENT',
            resourceId: assessmentId,
            firmId: existing.firmId,
            organizationId: existing.organizationId,
            ipAddress: clientIp,
            metadata: { reason: options?.reason || 'Consultant reopened invitation' },
        });
        return {
            assessmentId,
            status: updated.status,
            publicUrl: bundle.publicUrl,
            tokenExpiresAt: expiresAt ? expiresAt.toISOString() : null,
        };
    }
    async getAssessmentResults(actor, assessmentId, requestedLanguage, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        let assessment = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        if (!['COMPLETED', 'REVIEWED'].includes(assessment.status)) {
            throw new error_middleware_1.AppError(409, `Results are not available until the assessment is COMPLETED (current status: ${assessment.status}).`, 'https://tesp-api.talnova.io/errors/social-styles/results-not-ready');
        }
        const result = await this.repository.findResultByAssessmentId(assessmentId);
        if (!result) {
            throw new error_middleware_1.AppError(404, 'Calculated result record was not found for this assessment.', 'https://tesp-api.talnova.io/errors/social-styles/result-not-found');
        }
        // Transition COMPLETED -> REVIEWED on first consultant inspection
        if (assessment.status === 'COMPLETED') {
            const now = new Date();
            const updated = await this.repository.updateAssessment(assessmentId, {
                status: 'REVIEWED',
                reviewedAt: now,
            });
            if (updated)
                assessment = updated;
            await this.recordModuleAudit({
                actorId: actor.userId,
                actorRole: actor.role,
                action: 'SOCIAL_STYLES_RESULTS_REVIEWED',
                resourceType: 'ASSESSMENT',
                resourceId: assessmentId,
                firmId: assessment.firmId,
                organizationId: assessment.organizationId,
                ipAddress: clientIp,
            });
        }
        const language = requestedLanguage || assessment.language || 'en';
        const catalog = await this.repository.getInterpretationTemplates(assessment.questionnaireVersion);
        const localizedBundle = style_interpretations_definition_1.SocialStyleInterpretationService.getLocalizedBundle(language, catalog);
        const orderedStyles = style_interpretations_definition_1.SocialStyleInterpretationService.getOrderedStyleGuidance(result.finalScores, language, catalog);
        return {
            assessment: this.formatConsultantAssessmentResponse(assessment, null),
            result: {
                resultId: result.resultId,
                questionnaireVersion: result.questionnaireVersion,
                scoringVersion: result.scoringVersion,
                graphVersion: result.graphVersion,
                calculatedAt: result.calculatedAt.toISOString(),
                rawScores: result.rawScores,
                finalScores: result.finalScores,
                fourAxisProfile: result.fourAxisProfile,
                netBalanceCoordinate: result.netBalanceCoordinate,
                highestScoredStyles: result.highestScoredStyles,
                answerBreakdown: result.answerBreakdown.map((item) => ({
                    questionNumber: item.questionNumber,
                    selectedOption: item.selectedOption,
                    optionLabel: (0, questionnaire_v1_definition_1.getQuestionOptionLabel)(item.questionNumber, item.selectedOption, language),
                    optionLabelEn: (0, questionnaire_v1_definition_1.getQuestionOptionLabel)(item.questionNumber, item.selectedOption, 'en'),
                    mappedStyle: item.mappedStyle,
                })),
            },
            interpretation: {
                version: catalog.version,
                contentStatus: catalog.contentStatus,
                language,
                translationStatus: localizedBundle.translationStatus,
                disclaimer: localizedBundle.disclaimer,
                fourAxisExplanation: localizedBundle.fourAxisExplanation,
                netCoordinateExplanation: localizedBundle.netCoordinateExplanation,
                orderedStyleGuidance: orderedStyles,
            },
        };
    }
    // ==========================================================================
    // 2. Public Respondent Lifecycle (Unauthenticated, Token-Guarded)
    // ==========================================================================
    async resolveValidPublicAssessmentOrThrow(rawToken) {
        if (!this.tokenService.isWellFormedToken(rawToken)) {
            throw new error_middleware_1.AppError(404, 'Invalid or unrecognized assessment invitation link.', 'https://tesp-api.talnova.io/errors/social-styles/invalid-public-token');
        }
        const publicTokenHash = this.tokenService.hashToken(rawToken);
        const assessment = await this.repository.findAssessmentByPublicTokenHash(publicTokenHash);
        if (!assessment) {
            throw new error_middleware_1.AppError(404, 'Invalid or unrecognized assessment invitation link.', 'https://tesp-api.talnova.io/errors/social-styles/invalid-public-token');
        }
        const validation = this.tokenService.validateTokenAgainstAssessmentState(rawToken, assessment);
        if (!validation.valid) {
            if (validation.reason === 'TOKEN_EXPIRED') {
                if (assessment.status !== 'EXPIRED') {
                    await this.repository.updateAssessment(assessment.assessmentId, { status: 'EXPIRED' });
                }
                throw new error_middleware_1.AppError(410, 'This assessment invitation link has expired. Please contact your consultant for a new link.', 'https://tesp-api.talnova.io/errors/social-styles/public-link-expired');
            }
            if (validation.reason === 'TOKEN_REVOKED' || validation.reason === 'ASSESSMENT_CANCELLED') {
                throw new error_middleware_1.AppError(410, 'This assessment invitation link is no longer active. Please contact your consultant.', 'https://tesp-api.talnova.io/errors/social-styles/public-link-revoked');
            }
            if (validation.reason === 'ASSESSMENT_COMPLETED') {
                throw new error_middleware_1.AppError(409, 'This Social Styles questionnaire has already been completed and submitted.', 'https://tesp-api.talnova.io/errors/social-styles/assessment-already-submitted');
            }
            throw new error_middleware_1.AppError(404, 'Invalid assessment invitation link.', 'https://tesp-api.talnova.io/errors/social-styles/invalid-public-token');
        }
        return { assessment, publicTokenHash };
    }
    async getPublicQuestionnaireSession(rawToken) {
        const { assessment } = await this.resolveValidPublicAssessmentOrThrow(rawToken);
        const response = await this.repository.findResponseByAssessmentId(assessment.assessmentId);
        const selectedLanguage = response?.selectedLanguage || assessment.language || 'en';
        const publicQuestionnaire = (0, questionnaire_v1_definition_1.getPublicQuestionnaireView)(questionnaire_v1_definition_1.QUESTIONNAIRE_V1_DEFINITION);
        return {
            assessment: {
                assessmentId: assessment.assessmentId,
                title: assessment.title,
                reference: assessment.reference || null,
                participantName: assessment.participantName,
                organizationName: assessment.organizationName || null,
                consultantName: assessment.consultantName,
                firmName: assessment.firmName || 'DAASH Global',
                status: assessment.status,
                selectedLanguage,
                supportedLanguages: publicQuestionnaire.supportedLanguages,
                tokenExpiresAt: assessment.tokenExpiresAt
                    ? assessment.tokenExpiresAt.toISOString()
                    : null,
            },
            questionnaire: publicQuestionnaire,
            draftProgress: {
                selectedLanguage,
                draftAnswers: response?.draftAnswers || [],
                lastSavedAt: response?.lastSavedAt ? response.lastSavedAt.toISOString() : null,
            },
        };
    }
    async startPublicAssessment(rawToken, language, clientIp = '127.0.0.1') {
        const { assessment } = await this.resolveValidPublicAssessmentOrThrow(rawToken);
        const now = new Date();
        const selectedLanguage = language || assessment.language || 'en';
        const startedAt = assessment.startedAt || now;
        const updated = await this.repository.updateAssessment(assessment.assessmentId, {
            status: 'IN_PROGRESS',
            startedAt,
            language: selectedLanguage,
        });
        await this.recordModuleAudit({
            actorId: 'PUBLIC_RESPONDENT',
            actorRole: 'PUBLIC_RESPONDENT',
            action: 'SOCIAL_STYLES_ASSESSMENT_STARTED',
            resourceType: 'ASSESSMENT',
            resourceId: assessment.assessmentId,
            firmId: assessment.firmId,
            organizationId: assessment.organizationId,
            ipAddress: clientIp,
            metadata: { selectedLanguage },
        });
        return {
            status: updated.status,
            startedAt: startedAt.toISOString(),
            selectedLanguage,
        };
    }
    async savePublicProgress(rawToken, input, userAgent) {
        const { assessment } = await this.resolveValidPublicAssessmentOrThrow(rawToken);
        // Ensure no duplicate questionNumbers in draftAnswers
        const seen = new Set();
        for (const item of input.draftAnswers) {
            if (seen.has(item.questionNumber)) {
                throw new error_middleware_1.AppError(400, `Duplicate draft answer for question ${item.questionNumber}.`, 'https://tesp-api.talnova.io/errors/social-styles/duplicate-draft-answer');
            }
            seen.add(item.questionNumber);
        }
        const selectedLanguage = input.selectedLanguage || assessment.language || 'en';
        const sortedDrafts = [...input.draftAnswers].sort((a, b) => a.questionNumber - b.questionNumber);
        if (assessment.status === 'INVITED' || assessment.status === 'REOPENED') {
            await this.repository.updateAssessment(assessment.assessmentId, {
                status: 'IN_PROGRESS',
                startedAt: assessment.startedAt || new Date(),
                language: selectedLanguage,
            });
        }
        const saved = await this.repository.saveDraftProgress({
            assessmentId: assessment.assessmentId,
            consultantId: assessment.consultantId,
            questionnaireVersion: assessment.questionnaireVersion,
            selectedLanguage,
            draftAnswers: sortedDrafts,
            respondentUserAgent: userAgent,
        });
        return {
            status: 'IN_PROGRESS',
            answeredCount: saved.draftAnswers.length,
            totalQuestions: 20,
            selectedLanguage: saved.selectedLanguage,
            lastSavedAt: saved.lastSavedAt.toISOString(),
        };
    }
    async submitPublicAssessment(rawToken, input, clientIp = '127.0.0.1', userAgent) {
        const { assessment, publicTokenHash } = await this.resolveValidPublicAssessmentOrThrow(rawToken);
        const selectedLanguage = input.selectedLanguage || assessment.language || 'en';
        // 1. Validate all 20 answers and compute authoritative scores in memory first
        let scoringOutput;
        try {
            scoringOutput = this.scoringService.calculateScores(input.answers, undefined, answer_key_v1_definition_1.CURRENT_SCORING_VERSION);
        }
        catch (err) {
            if (err instanceof social_style_scoring_service_1.SocialStyleScoringValidationError) {
                throw new error_middleware_1.AppError(400, err.message, 'https://tesp-api.talnova.io/errors/social-styles/invalid-answers', err.errors);
            }
            throw err;
        }
        const graphOutput = this.graphService.calculateGraphData(scoringOutput.finalScores, scoringOutput.rawScores, answer_key_v1_definition_1.CURRENT_GRAPH_VERSION);
        const now = new Date();
        // 2. Atomically claim submission state transition (prevents race-condition duplicate submissions)
        const claimedAssessment = await this.repository.claimAssessmentSubmissionAtomic(assessment.assessmentId, publicTokenHash, selectedLanguage, now);
        if (!claimedAssessment) {
            throw new error_middleware_1.AppError(409, 'This Social Styles questionnaire has already been submitted.', 'https://tesp-api.talnova.io/errors/social-styles/assessment-already-submitted');
        }
        // 3. Persist locked response & authoritative result
        const normalizedAnswers = scoringOutput.answerBreakdown.map((b) => ({
            questionNumber: b.questionNumber,
            selectedOption: b.selectedOption,
        }));
        await this.repository.saveSubmittedResponse({
            assessmentId: assessment.assessmentId,
            consultantId: assessment.consultantId,
            questionnaireVersion: assessment.questionnaireVersion,
            selectedLanguage,
            answers: normalizedAnswers,
            submittedAt: now,
            respondentUserAgent: userAgent,
        });
        const resultId = `SSRES-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${crypto_1.default
            .randomBytes(4)
            .toString('hex')
            .toUpperCase()}`;
        await this.repository.saveResult({
            resultId,
            assessmentId: assessment.assessmentId,
            consultantId: assessment.consultantId,
            questionnaireVersion: assessment.questionnaireVersion,
            scoringVersion: scoringOutput.scoringVersion,
            graphVersion: graphOutput.graphVersion,
            answerBreakdown: scoringOutput.answerBreakdown,
            rawScores: scoringOutput.rawScores,
            finalScores: scoringOutput.finalScores,
            fourAxisProfile: graphOutput.fourAxisProfile,
            netBalanceCoordinate: graphOutput.netBalanceCoordinate,
            highestScoredStyles: scoringOutput.highestScoredStyles,
            calculatedAt: now,
        });
        await this.recordModuleAudit({
            actorId: 'PUBLIC_RESPONDENT',
            actorRole: 'PUBLIC_RESPONDENT',
            action: 'SOCIAL_STYLES_ASSESSMENT_SUBMITTED',
            resourceType: 'ASSESSMENT',
            resourceId: assessment.assessmentId,
            firmId: assessment.firmId,
            organizationId: assessment.organizationId,
            ipAddress: clientIp,
            metadata: {
                selectedLanguage,
                scoringVersion: scoringOutput.scoringVersion,
                graphVersion: graphOutput.graphVersion,
            },
        });
        return {
            status: 'COMPLETED',
            assessmentId: assessment.assessmentId,
            submittedAt: now.toISOString(),
            selectedLanguage,
            confirmationMessage: selectedLanguage === 'si'
                ? 'ස්තූතියි. ඔබගේ ප්‍රතිචාර සාර්ථකව යොමු කරන ලදී.'
                : selectedLanguage === 'ta'
                    ? 'நன்றி. உங்கள் பதில்கள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டன.'
                    : 'Thank you. Your Social Styles questionnaire has been submitted successfully to your consultant.',
        };
    }
    // ==========================================================================
    // 3. PDF Report Generation & Recoverable FIRST_EXPORT_ONLY Commercial Ledger
    // ==========================================================================
    async exportAssessmentReport(actor, assessmentId, options, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const assessment = await this.getAuthorizedAssessmentOrThrow(actor, assessmentId);
        if (!['COMPLETED', 'REVIEWED'].includes(assessment.status)) {
            throw new error_middleware_1.AppError(409, `Cannot export report until assessment is COMPLETED (current status: ${assessment.status}).`, 'https://tesp-api.talnova.io/errors/social-styles/results-not-ready');
        }
        const result = await this.repository.findResultByAssessmentId(assessmentId);
        if (!result) {
            throw new error_middleware_1.AppError(404, 'Calculated result not found for this assessment.', 'https://tesp-api.talnova.io/errors/social-styles/result-not-found');
        }
        const language = options?.language || assessment.language || 'en';
        // 1. Check client-supplied idempotencyKey first to deduplicate rapid retries/double-clicks
        if (options?.idempotencyKey) {
            const scopedIdempotencyKey = `${actor.userId}:${assessmentId}:${options.idempotencyKey}`;
            const existingUsageEvent = await this.repository.findUsageEventByIdempotencyKey(scopedIdempotencyKey);
            if (existingUsageEvent) {
                const existingReport = await this.repository.findReportById(existingUsageEvent.reportId);
                if (existingReport) {
                    const cachedBuffer = existingReport.storageReference
                        ? await this.storageService.getArtifactBuffer(existingReport.storageReference)
                        : null;
                    if (cachedBuffer) {
                        return {
                            report: existingReport,
                            usageEvent: existingUsageEvent,
                            pdfBuffer: cachedBuffer,
                        };
                    }
                    // Re-render deterministically if ephemeral buffer was cleared, without creating new report or billing event
                    const catalog = await this.repository.getInterpretationTemplates(assessment.questionnaireVersion);
                    const regenerated = await this.pdfGenerator.generateReportPdf({
                        reportId: existingReport.reportId,
                        reportVersion: existingReport.reportVersion,
                        language: existingReport.language,
                        assessment,
                        result,
                        interpretationCatalog: catalog,
                        generatedAt: existingReport.generatedAt,
                    });
                    return {
                        report: existingReport,
                        usageEvent: existingUsageEvent,
                        pdfBuffer: regenerated.pdfBuffer,
                    };
                }
            }
        }
        const consultantSettings = await this.repository.getConsultantSettings(assessment.consultantId);
        const chargingPolicy = consultantSettings.chargingPolicy || 'FIRST_EXPORT_ONLY';
        // Check optional quota before generating a potentially billable export
        const wouldAttemptBillable = chargingPolicy === 'EVERY_EXPORT' ||
            (chargingPolicy === 'FIRST_EXPORT_ONLY' && !assessment.firstBillableExportId);
        if (wouldAttemptBillable && !this.isSuperAdmin(actor)) {
            const nowBuckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(new Date());
            if (typeof consultantSettings.monthlyReportQuota === 'number') {
                const monthEvents = await this.repository.getAllUsageEventsMatching({
                    consultantId: assessment.consultantId,
                    billingPeriod: nowBuckets.billingPeriod,
                    billableOnly: true,
                });
                if (monthEvents.length >= consultantSettings.monthlyReportQuota) {
                    throw new error_middleware_1.AppError(429, `Monthly billable report export quota (${consultantSettings.monthlyReportQuota}) reached.`, 'https://tesp-api.talnova.io/errors/social-styles/monthly-quota-exceeded');
                }
            }
            if (typeof consultantSettings.lifetimeReportQuota === 'number') {
                const lifetimeEvents = await this.repository.getAllUsageEventsMatching({
                    consultantId: assessment.consultantId,
                    billableOnly: true,
                });
                if (lifetimeEvents.length >= consultantSettings.lifetimeReportQuota) {
                    throw new error_middleware_1.AppError(429, `Lifetime billable report export quota (${consultantSettings.lifetimeReportQuota}) reached.`, 'https://tesp-api.talnova.io/errors/social-styles/lifetime-quota-exceeded');
                }
            }
        }
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const reportId = `SSRPT-${datePart}-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
        const candidateEventId = `SSUSE-${datePart}-${crypto_1.default
            .randomBytes(4)
            .toString('hex')
            .toUpperCase()}`;
        const effectiveIdempotencyKey = options?.idempotencyKey
            ? `${actor.userId}:${assessmentId}:${options.idempotencyKey}`
            : `AUTO:${candidateEventId}`;
        const catalog = await this.repository.getInterpretationTemplates(assessment.questionnaireVersion);
        // 2. Generate and validate PDF buffer in memory BEFORE any database lock or ledger write!
        let generatedPdf;
        try {
            generatedPdf = await this.pdfGenerator.generateReportPdf({
                reportId,
                reportVersion: 'v1.0',
                language,
                assessment,
                result,
                interpretationCatalog: catalog,
                generatedAt: now,
            });
        }
        catch (err) {
            await this.recordModuleAudit({
                actorId: actor.userId,
                actorRole: actor.role,
                action: 'SOCIAL_STYLES_REPORT_EXPORT_FAILED',
                resourceType: 'ASSESSMENT',
                resourceId: assessmentId,
                firmId: assessment.firmId,
                organizationId: assessment.organizationId,
                ipAddress: clientIp,
                metadata: { reason: err?.message || 'PDF generation error' },
            });
            throw new error_middleware_1.AppError(500, 'Failed to generate Social Styles PDF report. No usage charge was recorded.', 'https://tesp-api.talnova.io/errors/social-styles/pdf-generation-failed');
        }
        // 3. Upload PDF buffer to StorageService (Cloudflare R2 / S3 or local fallback)
        const storageKey = `social-styles/reports/${assessment.assessmentId}/${reportId}.pdf`;
        await this.storageService.uploadArtifact(storageKey, generatedPdf.pdfBuffer, 'application/pdf');
        // 4. Determine billability via recoverable two-phase atomic claim (Section 4.1)
        let isBillable = false;
        let usageCategory = 'INITIAL_EXPORT';
        let nonBillableReason;
        let claimedFirstLock = false;
        if (chargingPolicy === 'FIRST_EXPORT_ONLY') {
            const claim = await this.repository.claimFirstBillableExportSlotAtomic(assessmentId, candidateEventId, now);
            if (claim.wonFirstExport) {
                isBillable = true;
                claimedFirstLock = true;
                usageCategory = 'INITIAL_EXPORT';
            }
            else {
                isBillable = false;
                usageCategory = 'RE_EXPORT';
                nonBillableReason = 'ALREADY_BILLED_FIRST_EXPORT';
            }
        }
        else if (chargingPolicy === 'EVERY_EXPORT') {
            isBillable = true;
            usageCategory = assessment.reportExportCount === 0 ? 'INITIAL_EXPORT' : 'RE_EXPORT';
        }
        else {
            // QUOTA_CREDIT policy
            isBillable = true;
            usageCategory = assessment.reportExportCount === 0 ? 'INITIAL_EXPORT' : 'RE_EXPORT';
        }
        // 5. Persist Report metadata record (rollback lock if report persistence fails)
        let reportRecord;
        try {
            reportRecord = await this.repository.saveReport({
                reportId,
                assessmentId,
                consultantId: assessment.consultantId,
                firmId: assessment.firmId,
                reportVersion: generatedPdf.reportVersion,
                scoringVersion: result.scoringVersion,
                interpretationVersion: generatedPdf.interpretationVersion,
                language,
                fileName: generatedPdf.fileName,
                fileSizeBytes: generatedPdf.fileSizeBytes,
                checksumSha256: generatedPdf.checksumSha256,
                storageReference: storageKey,
                status: 'GENERATED',
                usageEventId: candidateEventId,
                billable: isBillable,
                generatedBy: actor.userId,
                generatedAt: now,
            });
        }
        catch (err) {
            if (claimedFirstLock) {
                await this.repository.releaseFirstBillableExportSlotOnFailure(assessmentId, candidateEventId);
            }
            throw new error_middleware_1.AppError(500, 'Failed to persist report metadata. No usage charge was recorded.', 'https://tesp-api.talnova.io/errors/social-styles/report-persistence-failed');
        }
        // 6. Insert Immutable Usage Event into Ledger with duplicate-key & failure recovery
        const buckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(now);
        let usageEvent;
        try {
            usageEvent = await this.repository.recordUsageEvent({
                eventId: candidateEventId,
                idempotencyKey: effectiveIdempotencyKey,
                ...(isBillable && chargingPolicy === 'FIRST_EXPORT_ONLY'
                    ? { firstExportLockKey: `FIRST_BILLABLE:${assessmentId}` }
                    : {}),
                consultantId: assessment.consultantId,
                consultantName: assessment.consultantName,
                consultantEmail: assessment.consultantEmail,
                firmId: assessment.firmId,
                firmName: assessment.firmName,
                organizationId: assessment.organizationId,
                organizationName: assessment.organizationName,
                assessmentId: assessment.assessmentId,
                participantName: assessment.participantName,
                reportId: reportRecord.reportId,
                eventType: 'REPORT_EXPORTED',
                usageCategory,
                chargingPolicyApplied: chargingPolicy,
                billable: isBillable,
                nonBillableReason,
                exportFormat: 'PDF',
                reportVersion: generatedPdf.reportVersion,
                language,
                billingPeriod: buckets.billingPeriod,
                billingQuarter: buckets.billingQuarter,
                billingYear: buckets.billingYear,
                triggeredByUserId: actor.userId,
                triggeredByRole: actor.role,
                metadata: {
                    fileSizeBytes: generatedPdf.fileSizeBytes,
                    checksumSha256: generatedPdf.checksumSha256,
                    clientIp,
                },
                createdAt: now,
            });
        }
        catch (err) {
            // If duplicate firstExportLockKey (E11000), convert to non-billable RE_EXPORT seamlessly
            if (err?.code === 11000 && err?.keyPattern?.firstExportLockKey) {
                isBillable = false;
                usageCategory = 'RE_EXPORT';
                nonBillableReason = 'ALREADY_BILLED_FIRST_EXPORT';
                usageEvent = await this.repository.recordUsageEvent({
                    eventId: candidateEventId,
                    idempotencyKey: effectiveIdempotencyKey,
                    consultantId: assessment.consultantId,
                    consultantName: assessment.consultantName,
                    consultantEmail: assessment.consultantEmail,
                    firmId: assessment.firmId,
                    firmName: assessment.firmName,
                    organizationId: assessment.organizationId,
                    organizationName: assessment.organizationName,
                    assessmentId: assessment.assessmentId,
                    participantName: assessment.participantName,
                    reportId: reportRecord.reportId,
                    eventType: 'REPORT_EXPORTED',
                    usageCategory,
                    chargingPolicyApplied: chargingPolicy,
                    billable: false,
                    nonBillableReason,
                    exportFormat: 'PDF',
                    reportVersion: generatedPdf.reportVersion,
                    language,
                    billingPeriod: buckets.billingPeriod,
                    billingQuarter: buckets.billingQuarter,
                    billingYear: buckets.billingYear,
                    triggeredByUserId: actor.userId,
                    triggeredByRole: actor.role,
                    metadata: {
                        fileSizeBytes: generatedPdf.fileSizeBytes,
                        checksumSha256: generatedPdf.checksumSha256,
                        clientIp,
                    },
                    createdAt: now,
                });
            }
            else {
                // Transient ledger failure: release assessment lock and delete uncommitted report metadata
                if (claimedFirstLock) {
                    await this.repository.releaseFirstBillableExportSlotOnFailure(assessmentId, candidateEventId);
                }
                await this.repository.deleteReportById(reportRecord.reportId);
                throw new error_middleware_1.AppError(500, 'Failed to record report usage event in ledger. Assessment billing lock was rolled back.', 'https://tesp-api.talnova.io/errors/social-styles/ledger-write-failed');
            }
        }
        // 7. Commit lock or increment counters on Assessment
        if (claimedFirstLock && usageEvent.billable) {
            await this.repository.commitFirstBillableExportSlot(assessmentId, usageEvent.eventId, now, true);
        }
        else {
            await this.repository.incrementNonBillableExportCount(assessmentId, now, usageEvent.billable);
        }
        // 8. Record Audit Log
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_REPORT_EXPORTED',
            resourceType: 'REPORT',
            resourceId: reportRecord.reportId,
            firmId: assessment.firmId,
            organizationId: assessment.organizationId,
            ipAddress: clientIp,
            metadata: {
                assessmentId,
                usageEventId: usageEvent.eventId,
                billable: usageEvent.billable,
                usageCategory: usageEvent.usageCategory,
                language,
            },
        });
        return {
            report: reportRecord,
            usageEvent,
            pdfBuffer: generatedPdf.pdfBuffer,
        };
    }
    async downloadExistingReport(actor, reportId, clientIp = '127.0.0.1') {
        await this.assertConsultantModuleAccess(actor);
        const scope = this.isSuperAdmin(actor) ? undefined : actor.userId;
        const report = await this.repository.findReportById(reportId, scope);
        if (!report) {
            throw new error_middleware_1.AppError(404, `Social Styles report '${reportId}' was not found or you do not have access.`, 'https://tesp-api.talnova.io/errors/social-styles/report-not-found');
        }
        const assessment = await this.repository.findAssessmentById(report.assessmentId);
        const result = await this.repository.findResultByAssessmentId(report.assessmentId);
        if (!assessment || !result) {
            throw new error_middleware_1.AppError(404, 'Associated assessment or result not found.');
        }
        let pdfBuffer = report.storageReference
            ? await this.storageService.getArtifactBuffer(report.storageReference)
            : null;
        if (!pdfBuffer) {
            const catalog = await this.repository.getInterpretationTemplates(assessment.questionnaireVersion);
            const regenerated = await this.pdfGenerator.generateReportPdf({
                reportId: report.reportId,
                reportVersion: report.reportVersion,
                language: report.language,
                assessment,
                result,
                interpretationCatalog: catalog,
                generatedAt: report.generatedAt,
            });
            pdfBuffer = regenerated.pdfBuffer;
        }
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const eventId = `SSUSE-${datePart}-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
        const buckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(now);
        // Note: reportId has a unique index on REPORT_EXPORTED events; for re-downloads we use a unique report reference key
        const usageEvent = await this.repository.recordUsageEvent({
            eventId,
            idempotencyKey: `REDOWNLOAD:${eventId}`,
            consultantId: assessment.consultantId,
            consultantName: assessment.consultantName,
            consultantEmail: assessment.consultantEmail,
            firmId: assessment.firmId,
            firmName: assessment.firmName,
            organizationId: assessment.organizationId,
            organizationName: assessment.organizationName,
            assessmentId: assessment.assessmentId,
            participantName: assessment.participantName,
            reportId: `${report.reportId}#DL-${eventId}`,
            eventType: 'REPORT_REDOWNLOADED',
            usageCategory: 'RE_DOWNLOAD',
            chargingPolicyApplied: 'FIRST_EXPORT_ONLY',
            billable: false,
            nonBillableReason: 'REDOWNLOAD_EXISTING_REPORT',
            exportFormat: 'PDF',
            reportVersion: report.reportVersion,
            language: report.language,
            billingPeriod: buckets.billingPeriod,
            billingQuarter: buckets.billingQuarter,
            billingYear: buckets.billingYear,
            triggeredByUserId: actor.userId,
            triggeredByRole: actor.role,
            metadata: { originalReportId: report.reportId, clientIp },
            createdAt: now,
        });
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_REPORT_REDOWNLOADED',
            resourceType: 'REPORT',
            resourceId: report.reportId,
            firmId: assessment.firmId,
            organizationId: assessment.organizationId,
            ipAddress: clientIp,
            metadata: { usageEventId: usageEvent.eventId, billable: false },
        });
        return {
            report,
            usageEvent,
            pdfBuffer,
        };
    }
    // ==========================================================================
    // 4. Consultant Dashboard, Reports & Usage Summary
    // ==========================================================================
    async getConsultantDashboard(actor, requestedConsultantId) {
        await this.assertConsultantModuleAccess(actor);
        const targetConsultantId = this.isSuperAdmin(actor) && requestedConsultantId ? requestedConsultantId : actor.userId;
        const [assessments, usageEvents, settings] = await Promise.all([
            this.repository.getAllAssessmentsForScope(targetConsultantId),
            this.repository.getAllUsageEventsMatching({ consultantId: targetConsultantId }),
            this.repository.getConsultantSettings(targetConsultantId),
        ]);
        const nowBuckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(new Date());
        const billableEvents = usageEvents.filter((e) => e.billable);
        const billableThisMonth = billableEvents.filter((e) => e.billingPeriod === nowBuckets.billingPeriod).length;
        const remainingMonthlyQuota = typeof settings.monthlyReportQuota === 'number'
            ? Math.max(0, settings.monthlyReportQuota - billableThisMonth)
            : null;
        const sortedRecent = [...assessments]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10)
            .map((a) => this.formatConsultantAssessmentResponse(a, null));
        return {
            kpis: {
                totalAssessments: assessments.length,
                draftCount: assessments.filter((a) => a.status === 'DRAFT').length,
                pendingInvitedCount: assessments.filter((a) => a.status === 'INVITED' || a.status === 'REOPENED').length,
                inProgressCount: assessments.filter((a) => a.status === 'IN_PROGRESS').length,
                completedCount: assessments.filter((a) => a.status === 'COMPLETED' || a.status === 'REVIEWED').length,
                reviewedCount: assessments.filter((a) => a.status === 'REVIEWED').length,
                expiredOrRevokedCount: assessments.filter((a) => ['EXPIRED', 'REVOKED', 'CANCELLED'].includes(a.status)).length,
                totalReportsExported: usageEvents.filter((e) => e.eventType === 'REPORT_EXPORTED').length,
                billableReportsTotal: billableEvents.length,
                billableReportsThisMonth: billableThisMonth,
                monthlyReportQuota: settings.monthlyReportQuota,
                remainingMonthlyQuota,
                chargingPolicy: settings.chargingPolicy,
                moduleEnabled: settings.moduleEnabled,
            },
            recentAssessments: sortedRecent,
        };
    }
    async getConsultantReports(actor, params) {
        await this.assertConsultantModuleAccess(actor);
        const consultantScope = this.isSuperAdmin(actor) ? undefined : actor.userId;
        const { data, total } = await this.repository.listReportsForConsultant({
            consultantId: consultantScope,
            assessmentId: params.assessmentId,
            page: params.page,
            limit: params.limit,
        });
        return {
            data: data.map((r) => ({
                reportId: r.reportId,
                assessmentId: r.assessmentId,
                consultantId: r.consultantId,
                reportVersion: r.reportVersion,
                language: r.language,
                fileName: r.fileName,
                fileSizeBytes: r.fileSizeBytes,
                checksumSha256: r.checksumSha256,
                billable: r.billable,
                generatedAt: r.generatedAt.toISOString(),
            })),
            pagination: {
                total,
                page: params.page,
                limit: params.limit,
                totalPages: Math.ceil(total / params.limit) || 1,
            },
        };
    }
    async getConsultantUsage(actor, filter) {
        await this.assertConsultantModuleAccess(actor);
        const targetConsultantId = this.isSuperAdmin(actor) && filter.consultantId ? filter.consultantId : actor.userId;
        const [allEvents, pagedEvents, settings] = await Promise.all([
            this.repository.getAllUsageEventsMatching({ consultantId: targetConsultantId }),
            this.repository.listUsageEvents({ ...filter, consultantId: targetConsultantId }),
            this.repository.getConsultantSettings(targetConsultantId),
        ]);
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const nowBuckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(now);
        const billableEvents = allEvents.filter((e) => e.billable);
        const billableToday = billableEvents.filter((e) => e.createdAt.toISOString().slice(0, 10) === todayStr).length;
        const billableMonth = billableEvents.filter((e) => e.billingPeriod === nowBuckets.billingPeriod).length;
        const billableQuarter = billableEvents.filter((e) => e.billingQuarter === nowBuckets.billingQuarter).length;
        const monthlyMap = new Map();
        for (const ev of allEvents) {
            const curr = monthlyMap.get(ev.billingPeriod) || {
                billingPeriod: ev.billingPeriod,
                billableCount: 0,
                nonBillableCount: 0,
                totalExports: 0,
            };
            if (ev.billable)
                curr.billableCount += 1;
            else
                curr.nonBillableCount += 1;
            curr.totalExports += 1;
            monthlyMap.set(ev.billingPeriod, curr);
        }
        return {
            summary: {
                consultantId: targetConsultantId,
                chargingPolicy: settings.chargingPolicy,
                currentMonthPeriod: nowBuckets.billingPeriod,
                billableExportsToday: billableToday,
                billableExportsCurrentMonth: billableMonth,
                billableExportsCurrentQuarter: billableQuarter,
                billableExportsLifetime: billableEvents.length,
                nonBillableReExportsLifetime: allEvents.filter((e) => !e.billable).length,
                monthlyReportQuota: settings.monthlyReportQuota,
                remainingMonthlyQuota: typeof settings.monthlyReportQuota === 'number'
                    ? Math.max(0, settings.monthlyReportQuota - billableMonth)
                    : null,
            },
            monthlyBreakdown: Array.from(monthlyMap.values()).sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
            events: {
                data: pagedEvents.data.map((e) => this.formatUsageEventResponse(e)),
                pagination: {
                    total: pagedEvents.total,
                    page: filter.page,
                    limit: filter.limit,
                    totalPages: Math.ceil(pagedEvents.total / filter.limit) || 1,
                },
            },
        };
    }
    // ==========================================================================
    // 5. Super Admin Governance & Usage Monitoring
    // ==========================================================================
    assertSuperAdmin(actor) {
        if (!this.isSuperAdmin(actor)) {
            throw new error_middleware_1.AppError(403, 'Super Admin authorization is required for this endpoint.', 'https://tesp-api.talnova.io/errors/social-styles/super-admin-required');
        }
    }
    async getSuperAdminDashboard(actor, filter) {
        this.assertSuperAdmin(actor);
        const [assessments, usageEvents, consultantsTable] = await Promise.all([
            this.repository.getAllAssessmentsForScope(),
            this.repository.getAllUsageEventsMatching({
                firmId: filter?.firmId,
                startDate: filter?.startDate,
                endDate: filter?.endDate,
            }),
            this.getSuperAdminConsultantsTable(actor, { page: 1, limit: 500, firmId: filter?.firmId }),
        ]);
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const nowBuckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(now);
        const billableEvents = usageEvents.filter((e) => e.billable);
        const nonBillableEvents = usageEvents.filter((e) => !e.billable);
        const sortedConsultantsByUsage = [...consultantsTable.data].sort((a, b) => b.billableReportsExported - a.billableReportsExported);
        const topConsultant = sortedConsultantsByUsage.length > 0 && sortedConsultantsByUsage[0].billableReportsExported > 0
            ? {
                consultantId: sortedConsultantsByUsage[0].consultantId,
                consultantName: sortedConsultantsByUsage[0].consultantName,
                firmName: sortedConsultantsByUsage[0].firmName || null,
                billableReportsCount: sortedConsultantsByUsage[0].billableReportsExported,
            }
            : null;
        const monthlyMap = new Map();
        for (const ev of usageEvents) {
            const row = monthlyMap.get(ev.billingPeriod) || {
                billingPeriod: ev.billingPeriod,
                billableCount: 0,
                nonBillableCount: 0,
            };
            if (ev.billable)
                row.billableCount += 1;
            else
                row.nonBillableCount += 1;
            monthlyMap.set(ev.billingPeriod, row);
        }
        return {
            metrics: {
                totalRegisteredConsultants: consultantsTable.pagination.total,
                activeConsultantsWithUsage: consultantsTable.data.filter((c) => c.billableReportsExported > 0).length,
                suspendedConsultantsCount: consultantsTable.data.filter((c) => !c.moduleEnabled).length,
                totalAssessmentsCreated: assessments.length,
                totalAssessmentsCompleted: assessments.filter((a) => a.status === 'COMPLETED' || a.status === 'REVIEWED').length,
                totalBillableReportsExported: billableEvents.length,
                totalNonBillableExports: nonBillableEvents.length,
                billableReportsToday: billableEvents.filter((e) => e.createdAt.toISOString().slice(0, 10) === todayStr).length,
                billableReportsThisMonth: billableEvents.filter((e) => e.billingPeriod === nowBuckets.billingPeriod).length,
                billableReportsThisQuarter: billableEvents.filter((e) => e.billingQuarter === nowBuckets.billingQuarter).length,
                billableReportsThisYear: billableEvents.filter((e) => e.billingYear === nowBuckets.billingYear).length,
                topConsultant,
            },
            monthlyTrend: Array.from(monthlyMap.values()).sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod)),
        };
    }
    async getSuperAdminConsultantsTable(actor, params) {
        this.assertSuperAdmin(actor);
        const [assessments, usageEvents] = await Promise.all([
            this.repository.getAllAssessmentsForScope(),
            this.repository.getAllUsageEventsMatching({
                firmId: params.firmId,
                startDate: params.startDate,
                endDate: params.endDate,
            }),
        ]);
        // Discover all consultants from Users collection (if connected) AND from assessments/usageEvents
        const consultantIdentityMap = new Map();
        if (mongoose_1.default.connection?.readyState === 1) {
            const [users, firms] = await Promise.all([
                user_schema_1.UserModel.find({
                    role: { $in: ['CONSULTANT', 'CONSULTANT_DAASH'] },
                })
                    .lean()
                    .catch(() => []),
                consulting_firm_schema_1.ConsultingFirmModel.find({}).lean().catch(() => []),
            ]);
            const firmMap = new Map();
            for (const f of firms) {
                firmMap.set(f.firmId, f.name);
            }
            for (const u of users) {
                consultantIdentityMap.set(u.userId, {
                    consultantId: u.userId,
                    consultantName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.userId,
                    consultantEmail: u.email || '',
                    role: u.role,
                    firmId: u.firmId,
                    firmName: u.firmId ? firmMap.get(u.firmId) : undefined,
                });
            }
        }
        for (const a of assessments) {
            if (!consultantIdentityMap.has(a.consultantId)) {
                consultantIdentityMap.set(a.consultantId, {
                    consultantId: a.consultantId,
                    consultantName: a.consultantName,
                    consultantEmail: a.consultantEmail || '',
                    role: 'CONSULTANT',
                    firmId: a.firmId,
                    firmName: a.firmName,
                });
            }
        }
        for (const e of usageEvents) {
            if (!consultantIdentityMap.has(e.consultantId)) {
                consultantIdentityMap.set(e.consultantId, {
                    consultantId: e.consultantId,
                    consultantName: e.consultantName,
                    consultantEmail: e.consultantEmail || '',
                    role: 'CONSULTANT',
                    firmId: e.firmId,
                    firmName: e.firmName,
                });
            }
        }
        const nowBuckets = (0, social_styles_schemas_1.deriveBillingTimeBuckets)(new Date());
        const rows = [];
        for (const identity of consultantIdentityMap.values()) {
            if (params.firmId && identity.firmId !== params.firmId)
                continue;
            const cAssessments = assessments.filter((a) => a.consultantId === identity.consultantId);
            const cEvents = usageEvents.filter((e) => e.consultantId === identity.consultantId);
            const cBillable = cEvents.filter((e) => e.billable);
            const cNonBillable = cEvents.filter((e) => !e.billable);
            const currentMonthBillable = cBillable.filter((e) => e.billingPeriod === nowBuckets.billingPeriod).length;
            const currentQuarterBillable = cBillable.filter((e) => e.billingQuarter === nowBuckets.billingQuarter).length;
            const settings = await this.repository.getConsultantSettings(identity.consultantId);
            const quotaUtilizationPercent = typeof settings.monthlyReportQuota === 'number' && settings.monthlyReportQuota > 0
                ? Math.round((currentMonthBillable / settings.monthlyReportQuota) * 100)
                : null;
            const isApproachingQuota = quotaUtilizationPercent !== null && quotaUtilizationPercent >= 80;
            const lastExport = cEvents.length > 0
                ? cEvents.reduce((latest, ev) => ev.createdAt.getTime() > latest.createdAt.getTime() ? ev : latest).createdAt
                : null;
            rows.push({
                consultantId: identity.consultantId,
                consultantName: identity.consultantName,
                consultantEmail: identity.consultantEmail,
                role: identity.role,
                firmId: identity.firmId || null,
                firmName: identity.firmName || null,
                assessmentsCreated: cAssessments.length,
                assessmentsCompleted: cAssessments.filter((a) => a.status === 'COMPLETED' || a.status === 'REVIEWED').length,
                billableReportsExported: cBillable.length,
                nonBillableReportsExported: cNonBillable.length,
                currentMonthBillable,
                currentQuarterBillable,
                lifetimeBillableUsage: cBillable.length,
                chargingPolicy: settings.chargingPolicy,
                monthlyReportQuota: settings.monthlyReportQuota,
                lifetimeReportQuota: settings.lifetimeReportQuota,
                quotaUtilizationPercent,
                isApproachingQuota,
                moduleEnabled: settings.moduleEnabled,
                suspensionReason: settings.suspensionReason,
                lastExportAt: lastExport ? lastExport.toISOString() : null,
            });
        }
        let filteredRows = rows;
        if (params.search) {
            const q = params.search.trim().toLowerCase();
            filteredRows = filteredRows.filter((r) => r.consultantName.toLowerCase().includes(q) ||
                r.consultantEmail.toLowerCase().includes(q) ||
                r.consultantId.toLowerCase().includes(q) ||
                (r.firmName || '').toLowerCase().includes(q));
        }
        if (params.status === 'ACTIVE') {
            filteredRows = filteredRows.filter((r) => r.moduleEnabled);
        }
        else if (params.status === 'SUSPENDED') {
            filteredRows = filteredRows.filter((r) => !r.moduleEnabled);
        }
        else if (params.status === 'APPROACHING_QUOTA') {
            filteredRows = filteredRows.filter((r) => r.isApproachingQuota);
        }
        filteredRows.sort((a, b) => b.billableReportsExported - a.billableReportsExported);
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(200, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        return {
            data: filteredRows.slice(skip, skip + limit),
            pagination: {
                total: filteredRows.length,
                page,
                limit,
                totalPages: Math.ceil(filteredRows.length / limit) || 1,
            },
        };
    }
    async getSuperAdminUsageAnalytics(actor, filter) {
        this.assertSuperAdmin(actor);
        const allEvents = await this.repository.getAllUsageEventsMatching(filter);
        const paged = await this.repository.listUsageEvents(filter);
        if (filter.format === 'csv') {
            const header = 'Event ID,Timestamp,Consultant ID,Consultant Name,Firm Name,Assessment ID,Participant Name,Report ID,Category,Policy,Billable,Billing Period,Billing Quarter';
            const lines = allEvents.map((e) => [
                e.eventId,
                e.createdAt.toISOString(),
                e.consultantId,
                `"${(e.consultantName || '').replace(/"/g, '""')}"`,
                `"${(e.firmName || '').replace(/"/g, '""')}"`,
                e.assessmentId,
                `"${(e.participantName || '').replace(/"/g, '""')}"`,
                e.reportId,
                e.usageCategory,
                e.chargingPolicyApplied,
                e.billable ? 'YES' : 'NO',
                e.billingPeriod,
                e.billingQuarter,
            ].join(','));
            return {
                csv: [header, ...lines].join('\n'),
                fileName: `social-styles-usage-${new Date().toISOString().slice(0, 10)}.csv`,
            };
        }
        return {
            summary: {
                totalEventsMatching: allEvents.length,
                billableCount: allEvents.filter((e) => e.billable).length,
                nonBillableCount: allEvents.filter((e) => !e.billable).length,
            },
            data: paged.data.map((e) => this.formatUsageEventResponse(e)),
            pagination: {
                total: paged.total,
                page: filter.page,
                limit: filter.limit,
                totalPages: Math.ceil(paged.total / filter.limit) || 1,
            },
        };
    }
    async getSuperAdminConsultantDetail(actor, consultantId, page = 1, limit = 20) {
        this.assertSuperAdmin(actor);
        const [usageData, assessments, settings] = await Promise.all([
            this.getConsultantUsage(actor, { consultantId, page, limit }),
            this.repository.listAssessments({ consultantId, page: 1, limit: 20 }),
            this.repository.getConsultantSettings(consultantId),
        ]);
        return {
            consultantId,
            settings,
            usage: usageData,
            recentAssessments: assessments.data.map((a) => this.formatConsultantAssessmentResponse(a, null)),
        };
    }
    async updateConsultantAccess(actor, consultantId, updates, clientIp = '127.0.0.1') {
        this.assertSuperAdmin(actor);
        const updated = await this.repository.upsertConsultantSettings(consultantId, updates, actor.userId);
        const action = updates.moduleEnabled === false
            ? 'SOCIAL_STYLES_CONSULTANT_SUSPENDED'
            : updates.moduleEnabled === true
                ? 'SOCIAL_STYLES_CONSULTANT_REACTIVATED'
                : 'SOCIAL_STYLES_CONSULTANT_ACCESS_UPDATED';
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action,
            resourceType: 'CONSULTANT_SETTINGS',
            resourceId: consultantId,
            firmId: updated.firmId,
            ipAddress: clientIp,
            metadata: updates,
        });
        return { settings: updated };
    }
    async updateInterpretationTemplates(actor, catalog, clientIp = '127.0.0.1') {
        this.assertSuperAdmin(actor);
        const saved = await this.repository.updateInterpretationTemplates(catalog, actor.userId);
        await this.recordModuleAudit({
            actorId: actor.userId,
            actorRole: actor.role,
            action: 'SOCIAL_STYLES_TEMPLATES_UPDATED',
            resourceType: 'QUESTIONNAIRE_TEMPLATE',
            resourceId: saved.version,
            ipAddress: clientIp,
            metadata: {
                version: saved.version,
                contentStatus: saved.contentStatus,
            },
        });
        return { interpretationTemplates: saved };
    }
    async getInterpretationTemplates(actor) {
        await this.assertConsultantModuleAccess(actor);
        const templates = await this.repository.getInterpretationTemplates();
        return { interpretationTemplates: templates };
    }
    // ==========================================================================
    // Formatting & Audit Helpers
    // ==========================================================================
    formatConsultantAssessmentResponse(a, publicUrl) {
        return {
            assessmentId: a.assessmentId,
            consultantId: a.consultantId,
            consultantName: a.consultantName,
            consultantEmail: a.consultantEmail || null,
            firmId: a.firmId || null,
            firmName: a.firmName || null,
            organizationId: a.organizationId || null,
            organizationName: a.organizationName || null,
            participantId: a.participantId || null,
            participantName: a.participantName,
            participantEmail: a.participantEmail,
            participantPhone: a.participantPhone || null,
            title: a.title,
            reference: a.reference || null,
            consultantNotes: a.consultantNotes || null,
            language: a.language,
            questionnaireVersion: a.questionnaireVersion,
            status: a.status,
            hasActivePublicLink: Boolean(a.publicTokenHash && ['INVITED', 'IN_PROGRESS', 'REOPENED'].includes(a.status)),
            ...(publicUrl ? { publicUrl } : {}),
            tokenExpiresAt: a.tokenExpiresAt ? a.tokenExpiresAt.toISOString() : null,
            tokenRevokedAt: a.tokenRevokedAt ? a.tokenRevokedAt.toISOString() : null,
            invitedAt: a.invitedAt ? a.invitedAt.toISOString() : null,
            startedAt: a.startedAt ? a.startedAt.toISOString() : null,
            completedAt: a.completedAt ? a.completedAt.toISOString() : null,
            reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
            firstExportedAt: a.firstExportedAt ? a.firstExportedAt.toISOString() : null,
            lastReportExportedAt: a.lastReportExportedAt
                ? a.lastReportExportedAt.toISOString()
                : null,
            reportExportCount: a.reportExportCount,
            billableExportCount: a.billableExportCount,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
        };
    }
    formatUsageEventResponse(e) {
        return {
            eventId: e.eventId,
            consultantId: e.consultantId,
            consultantName: e.consultantName,
            consultantEmail: e.consultantEmail || null,
            firmId: e.firmId || null,
            firmName: e.firmName || null,
            organizationId: e.organizationId || null,
            organizationName: e.organizationName || null,
            assessmentId: e.assessmentId,
            participantName: e.participantName,
            reportId: e.reportId.split('#')[0],
            eventType: e.eventType,
            usageCategory: e.usageCategory,
            chargingPolicyApplied: e.chargingPolicyApplied,
            billable: e.billable,
            nonBillableReason: e.nonBillableReason || null,
            exportFormat: e.exportFormat,
            reportVersion: e.reportVersion,
            language: e.language,
            billingPeriod: e.billingPeriod,
            billingQuarter: e.billingQuarter,
            billingYear: e.billingYear,
            triggeredByUserId: e.triggeredByUserId,
            triggeredByRole: e.triggeredByRole,
            createdAt: e.createdAt.toISOString(),
        };
    }
    async recordModuleAudit(params) {
        await this.auditLogService.recordAuditLog({
            module: 'SOCIAL_STYLES',
            projectId: params.organizationId,
            firmId: params.firmId,
            organizationId: params.organizationId,
            actorId: params.actorId,
            actorRole: params.actorRole,
            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            metadata: params.metadata || {},
            ipAddress: params.ipAddress || '127.0.0.1',
            timestamp: new Date(),
        });
    }
}
exports.SocialStylesApplicationService = SocialStylesApplicationService;
//# sourceMappingURL=social-styles-application.service.js.map