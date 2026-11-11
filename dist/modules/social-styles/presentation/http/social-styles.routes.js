"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialStylesPublicRateLimiter = void 0;
exports.createSocialStylesRouter = createSocialStylesRouter;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const rate_limit_middleware_1 = require("../../../../shared/presentation/middleware/rate-limit.middleware");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const social_styles_application_service_1 = require("../../application/services/social-styles-application.service");
const social_styles_dto_1 = require("../../application/dto/social-styles.dto");
/**
 * Dedicated rate limiter for unauthenticated public respondent endpoints:
 * 30 requests per minute per IP address.
 */
exports.socialStylesPublicRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_SOCIAL_STYLES_PUBLIC_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_SOCIAL_STYLES_PUBLIC_MAX) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'];
    },
    handler: (0, rate_limit_middleware_1.createRfc7807Handler)('Too many Social Styles public questionnaire requests from this IP address. Please wait a moment and try again.'),
});
/**
 * Role guard tailored for the Social Styles bounded context.
 * Enforces strict RBAC without coupling consultant-owned Social Styles resources
 * to Survey Engine `X-Project-ID` headers.
 */
function authorizeSocialStylesRoles(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                type: 'https://tesp-api.talnova.io/errors/unauthorized',
                title: 'Unauthorized',
                status: 401,
                detail: 'Authentication context is required.',
                instance: req.originalUrl,
            });
            return;
        }
        const effectiveRole = (0, auth_middleware_1.normalizeUserRole)(req.user.role);
        const normalizedAllowed = allowedRoles.map((r) => (0, auth_middleware_1.normalizeUserRole)(r));
        const isConsultantEffective = effectiveRole === auth_middleware_1.UserRole.CONSULTANT || effectiveRole === auth_middleware_1.UserRole.CONSULTANT_DAASH;
        const allowsConsultant = normalizedAllowed.includes(auth_middleware_1.UserRole.CONSULTANT) ||
            normalizedAllowed.includes(auth_middleware_1.UserRole.CONSULTANT_DAASH);
        const isAuthorized = normalizedAllowed.includes(effectiveRole) ||
            (isConsultantEffective && allowsConsultant);
        if (!isAuthorized) {
            res.status(403).json({
                type: 'https://tesp-api.talnova.io/errors/social-styles/forbidden',
                title: 'Forbidden',
                status: 403,
                detail: `User role '${req.user.role}' is not authorized to access this Social Styles endpoint.`,
                instance: req.originalUrl,
            });
            return;
        }
        next();
    };
}
function parseWithZod(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const firstIssue = err.issues[0];
            const message = firstIssue
                ? `${firstIssue.path.join('.') || 'input'}: ${firstIssue.message}`
                : 'Invalid request payload.';
            throw new error_middleware_1.AppError(400, message, 'https://tesp-api.talnova.io/errors/social-styles/validation-error', err.issues);
        }
        throw err;
    }
}
function extractClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || '127.0.0.1';
}
function createSocialStylesRouter(service = new social_styles_application_service_1.SocialStylesApplicationService()) {
    const router = (0, express_1.Router)();
    const consultantAllowedRoles = [
        auth_middleware_1.UserRole.SUPER_ADMIN,
        auth_middleware_1.UserRole.CONSULTANT,
        auth_middleware_1.UserRole.CONSULTANT_DAASH,
    ];
    const superAdminOnly = [auth_middleware_1.UserRole.SUPER_ADMIN];
    // ============================================================================
    // 1. PUBLIC RESPONDENT ENDPOINTS (/api/v1/social-styles/public/*)
    //    Must be registered BEFORE /social-styles/* JWT middleware!
    // ============================================================================
    router.get('/social-styles/public/qr-sessions/:sessionToken', exports.socialStylesPublicRateLimiter, async (req, res, next) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            const payload = await service.getPublicQrSession(req.params.sessionToken);
            res.status(200).json(payload);
        }
        catch (err) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next(err);
        }
    });
    router.post('/social-styles/public/qr-sessions/:sessionToken/register', exports.socialStylesPublicRateLimiter, async (req, res, next) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            const body = parseWithZod(social_styles_dto_1.RegisterViaQrSessionSchema, req.body || {});
            const payload = await service.registerParticipantViaQrSession(req.params.sessionToken, body, extractClientIp(req));
            res.status(201).json(payload);
        }
        catch (err) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next(err);
        }
    });
    router.get('/social-styles/public/:token', exports.socialStylesPublicRateLimiter, async (req, res, next) => {
        try {
            const payload = await service.getPublicQuestionnaireSession(req.params.token);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/public/:token/start', exports.socialStylesPublicRateLimiter, async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.StartPublicAssessmentSchema, req.body || {});
            const payload = await service.startPublicAssessment(req.params.token, body.language, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.put('/social-styles/public/:token/progress', exports.socialStylesPublicRateLimiter, async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.SavePublicProgressSchema, req.body || {});
            const payload = await service.savePublicProgress(req.params.token, body, req.headers['user-agent']);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/public/:token/submit', exports.socialStylesPublicRateLimiter, async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.SubmitPublicAssessmentSchema, req.body || {});
            const payload = await service.submitPublicAssessment(req.params.token, body, extractClientIp(req), req.headers['user-agent']);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    // ============================================================================
    // 2. CONSULTANT WORKSPACE ENDPOINTS (/api/v1/social-styles/*)
    // ============================================================================
    router.get('/social-styles/dashboard', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const consultantId = typeof req.query.consultantId === 'string' ? req.query.consultantId.trim() : undefined;
            const payload = await service.getConsultantDashboard(req.user, consultantId);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/assessments', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const query = parseWithZod(social_styles_dto_1.ListAssessmentsQuerySchema, req.query || {});
            const payload = await service.listAssessments(req.user, query);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments/bulk', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.BulkCreateAssessmentsSchema, req.body || {});
            const payload = await service.bulkCreateAssessments(req.user, body, extractClientIp(req));
            res.status(201).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.CreateAssessmentSchema, req.body || {});
            const payload = await service.createAssessment(req.user, body, extractClientIp(req));
            res.status(201).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/qr-sessions', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const consultantId = typeof req.query.consultantId === 'string' ? req.query.consultantId.trim() : undefined;
            const payload = await service.listQrSessions(req.user, consultantId);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/qr-sessions', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.CreateQrSessionSchema, req.body || {});
            const payload = await service.createQrSession(req.user, body, extractClientIp(req));
            res.status(201).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/qr-sessions/:qrSessionId', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const payload = await service.getQrSessionDetails(req.user, req.params.qrSessionId);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.patch('/social-styles/qr-sessions/:qrSessionId', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.UpdateQrSessionSchema, req.body || {});
            const payload = await service.updateQrSession(req.user, req.params.qrSessionId, body, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments/:id/send-invitation', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const payload = await service.sendAssessmentInvitationEmail(req.user, req.params.id, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/assessments/:id', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const payload = await service.getAssessmentDetails(req.user, req.params.id);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.patch('/social-styles/assessments/:id', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.UpdateAssessmentSchema, req.body || {});
            const payload = await service.updateAssessment(req.user, req.params.id, body, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments/:id/generate-link', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.GenerateLinkSchema, req.body || {});
            const payload = await service.generatePublicLink(req.user, req.params.id, body.tokenExpiresAt, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments/:id/revoke-link', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const payload = await service.revokePublicLink(req.user, req.params.id, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments/:id/reopen', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.ReopenAssessmentSchema, req.body || {});
            const payload = await service.reopenAssessment(req.user, req.params.id, body, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/assessments/:id/results', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const rawLang = typeof req.query.language === 'string' ? req.query.language : undefined;
            const language = rawLang ? parseWithZod(social_styles_dto_1.SupportedLanguageEnum, rawLang) : undefined;
            const payload = await service.getAssessmentResults(req.user, req.params.id, language, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.post('/social-styles/assessments/:id/reports', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.ExportReportSchema, req.body || {});
            const exported = await service.exportAssessmentReport(req.user, req.params.id, {
                language: body.language,
                idempotencyKey: body.idempotencyKey,
            }, extractClientIp(req));
            res.setHeader('X-Report-Id', exported.report.reportId);
            res.setHeader('X-Usage-Event-Id', exported.usageEvent.eventId);
            res.setHeader('X-Usage-Billable', String(exported.usageEvent.billable));
            const acceptHeader = (req.headers.accept || '').toLowerCase();
            if (acceptHeader.includes('application/pdf') && !acceptHeader.includes('application/json')) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${exported.report.fileName}"`);
                res.status(200).send(exported.pdfBuffer);
                return;
            }
            res.status(200).json({
                report: {
                    reportId: exported.report.reportId,
                    assessmentId: exported.report.assessmentId,
                    consultantId: exported.report.consultantId,
                    reportVersion: exported.report.reportVersion,
                    scoringVersion: exported.report.scoringVersion,
                    interpretationVersion: exported.report.interpretationVersion,
                    language: exported.report.language,
                    fileName: exported.report.fileName,
                    fileSizeBytes: exported.report.fileSizeBytes,
                    checksumSha256: exported.report.checksumSha256,
                    status: exported.report.status,
                    billable: exported.report.billable,
                    generatedAt: exported.report.generatedAt.toISOString(),
                },
                usageEvent: {
                    eventId: exported.usageEvent.eventId,
                    usageCategory: exported.usageEvent.usageCategory,
                    chargingPolicyApplied: exported.usageEvent.chargingPolicyApplied,
                    billable: exported.usageEvent.billable,
                    nonBillableReason: exported.usageEvent.nonBillableReason || null,
                    billingPeriod: exported.usageEvent.billingPeriod,
                    billingQuarter: exported.usageEvent.billingQuarter,
                    createdAt: exported.usageEvent.createdAt.toISOString(),
                },
                pdfBase64: exported.pdfBuffer.toString('base64'),
            });
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/reports', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
            const assessmentId = typeof req.query.assessmentId === 'string' ? req.query.assessmentId.trim() : undefined;
            const payload = await service.getConsultantReports(req.user, {
                assessmentId,
                page,
                limit,
            });
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/reports/:reportId/download', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const downloaded = await service.downloadExistingReport(req.user, req.params.reportId, extractClientIp(req));
            res.setHeader('X-Report-Id', downloaded.report.reportId);
            res.setHeader('X-Usage-Event-Id', downloaded.usageEvent.eventId);
            res.setHeader('X-Usage-Billable', 'false');
            const acceptHeader = (req.headers.accept || '').toLowerCase();
            if (acceptHeader.includes('application/json') && !acceptHeader.includes('application/pdf')) {
                res.status(200).json({
                    report: {
                        reportId: downloaded.report.reportId,
                        assessmentId: downloaded.report.assessmentId,
                        fileName: downloaded.report.fileName,
                        fileSizeBytes: downloaded.report.fileSizeBytes,
                        checksumSha256: downloaded.report.checksumSha256,
                        language: downloaded.report.language,
                        billable: false,
                    },
                    usageEvent: {
                        eventId: downloaded.usageEvent.eventId,
                        usageCategory: downloaded.usageEvent.usageCategory,
                        billable: downloaded.usageEvent.billable,
                        nonBillableReason: downloaded.usageEvent.nonBillableReason,
                    },
                    pdfBase64: downloaded.pdfBuffer.toString('base64'),
                });
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${downloaded.report.fileName}"`);
            res.status(200).send(downloaded.pdfBuffer);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/usage', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const query = parseWithZod(social_styles_dto_1.ListUsageQuerySchema, req.query || {});
            const payload = await service.getConsultantUsage(req.user, {
                page: query.page,
                limit: query.limit,
                consultantId: query.consultantId,
                billingPeriod: query.billingPeriod,
                billingQuarter: query.billingQuarter,
                billableOnly: query.billableOnly,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
            });
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/social-styles/interpretation-templates', auth_middleware_1.authenticate, authorizeSocialStylesRoles(consultantAllowedRoles), async (req, res, next) => {
        try {
            const payload = await service.getInterpretationTemplates(req.user);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    // ============================================================================
    // 3. SUPER ADMIN GOVERNANCE ENDPOINTS (/api/v1/admin/social-styles/*)
    // ============================================================================
    router.get('/admin/social-styles/dashboard', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
            const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;
            const firmId = typeof req.query.firmId === 'string' ? req.query.firmId.trim() : undefined;
            const payload = await service.getSuperAdminDashboard(req.user, {
                startDate,
                endDate,
                firmId,
            });
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/admin/social-styles/consultants', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
            const firmId = typeof req.query.firmId === 'string' ? req.query.firmId.trim() : undefined;
            const rawStatus = typeof req.query.status === 'string' ? req.query.status : 'ALL';
            const status = ['ALL', 'ACTIVE', 'SUSPENDED', 'APPROACHING_QUOTA'].includes(rawStatus)
                ? rawStatus
                : 'ALL';
            const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
            const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;
            const payload = await service.getSuperAdminConsultantsTable(req.user, {
                search,
                firmId,
                status,
                startDate,
                endDate,
                page,
                limit,
            });
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/admin/social-styles/usage', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const query = parseWithZod(social_styles_dto_1.ListUsageQuerySchema, req.query || {});
            const payload = await service.getSuperAdminUsageAnalytics(req.user, {
                page: query.page,
                limit: query.limit,
                consultantId: query.consultantId,
                firmId: query.firmId,
                assessmentId: query.assessmentId,
                billingPeriod: query.billingPeriod,
                billingQuarter: query.billingQuarter,
                billableOnly: query.billableOnly,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
                format: query.format,
            });
            if ('csv' in payload && typeof payload.csv === 'string') {
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="${payload.fileName}"`);
                res.status(200).send(payload.csv);
                return;
            }
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/admin/social-styles/consultants/:consultantId/usage', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
            const payload = await service.getSuperAdminConsultantDetail(req.user, req.params.consultantId, page, limit);
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.patch('/admin/social-styles/consultants/:consultantId/access', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.UpdateConsultantAccessSchema, req.body || {});
            const payload = await service.updateConsultantAccess(req.user, req.params.consultantId, body, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.get('/admin/social-styles/export-history', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const query = parseWithZod(social_styles_dto_1.ListUsageQuerySchema, req.query || {});
            const payload = await service.getSuperAdminUsageAnalytics(req.user, {
                page: query.page,
                limit: query.limit,
                consultantId: query.consultantId,
                firmId: query.firmId,
                assessmentId: query.assessmentId,
                billingPeriod: query.billingPeriod,
                billingQuarter: query.billingQuarter,
                billableOnly: query.billableOnly,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
                format: 'json',
            });
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    router.put('/admin/social-styles/interpretation-templates', auth_middleware_1.authenticate, authorizeSocialStylesRoles(superAdminOnly), async (req, res, next) => {
        try {
            const body = parseWithZod(social_styles_dto_1.UpdateInterpretationTemplatesSchema, req.body || {});
            const payload = await service.updateInterpretationTemplates(req.user, {
                ...body,
                updatedAt: new Date().toISOString(),
                updatedBy: req.user.userId,
            }, extractClientIp(req));
            res.status(200).json(payload);
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=social-styles.routes.js.map