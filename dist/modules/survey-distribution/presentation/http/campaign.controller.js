"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const launch_campaign_use_case_1 = require("../../application/use-cases/launch-campaign.use-case");
const campaign_dto_1 = require("../dto/campaign.dto");
const crypto_1 = __importDefault(require("crypto"));
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
const webhook_signature_verifier_1 = require("../../infrastructure/security/webhook-signature-verifier");
class CampaignController {
    launchCampaignUseCase;
    getCampaignMetricsUseCase;
    listCampaignsUseCase;
    dispatchRemindersUseCase;
    validateAndBurnTokenUseCase;
    handleDeliveryWebhookUseCase;
    getOptimalDispatchTimeUseCase;
    generateKioskPinsUseCase;
    getCampaignKioskRosterUseCase;
    getMySurveysUseCase;
    completeCampaignUseCase;
    deleteCampaignUseCase;
    constructor(launchCampaignUseCase, getCampaignMetricsUseCase, listCampaignsUseCase, dispatchRemindersUseCase, validateAndBurnTokenUseCase, handleDeliveryWebhookUseCase, getOptimalDispatchTimeUseCase, generateKioskPinsUseCase, getCampaignKioskRosterUseCase, getMySurveysUseCase, completeCampaignUseCase, deleteCampaignUseCase) {
        this.launchCampaignUseCase = launchCampaignUseCase;
        this.getCampaignMetricsUseCase = getCampaignMetricsUseCase;
        this.listCampaignsUseCase = listCampaignsUseCase;
        this.dispatchRemindersUseCase = dispatchRemindersUseCase;
        this.validateAndBurnTokenUseCase = validateAndBurnTokenUseCase;
        this.handleDeliveryWebhookUseCase = handleDeliveryWebhookUseCase;
        this.getOptimalDispatchTimeUseCase = getOptimalDispatchTimeUseCase;
        this.generateKioskPinsUseCase = generateKioskPinsUseCase;
        this.getCampaignKioskRosterUseCase = getCampaignKioskRosterUseCase;
        this.getMySurveysUseCase = getMySurveysUseCase;
        this.completeCampaignUseCase = completeCampaignUseCase;
        this.deleteCampaignUseCase = deleteCampaignUseCase;
    }
    launchCampaign = async (req, res, next) => {
        try {
            const parsed = campaign_dto_1.LaunchCampaignDtoSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const validated = parsed.data;
            const campaign = await this.launchCampaignUseCase.execute({
                ...validated,
                startDate: new Date(validated.startDate),
                expirationDate: new Date(validated.expirationDate),
            });
            res.status(201).json({
                message: 'Campaign launched successfully',
                campaign: campaign.toJSON(),
            });
        }
        catch (err) {
            if (err instanceof launch_campaign_use_case_1.EmptyTargetAudienceError ||
                err.name === 'EmptyTargetAudienceError' ||
                (err.message && (err.message.includes('Invalid Campaign ID') ||
                    err.message.includes('already exists') ||
                    err.message.includes('expirationDate') ||
                    err.message.includes('target organizational node contains 0') ||
                    err.message.includes('Target audience is empty')))) {
                next(new error_middleware_1.AppError(400, err.message, 'https://tesp-api.talnova.io/errors/validation-failed'));
                return;
            }
            next(err);
        }
    };
    getCampaignMetrics = async (req, res, next) => {
        try {
            const { campaignId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const result = await this.getCampaignMetricsUseCase.execute(projectId, campaignId);
            res.status(200).json(result);
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message, 'https://tesp-api.talnova.io/errors/not-found'));
                return;
            }
            next(err);
        }
    };
    listCampaigns = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const status = req.query.status;
            const campaigns = await this.listCampaignsUseCase.execute(projectId, status);
            res.status(200).json({
                total: campaigns.length,
                campaigns: campaigns.map((c) => c.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
    dispatchReminders = async (req, res, next) => {
        try {
            const { campaignId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const result = await this.dispatchRemindersUseCase.execute(projectId, campaignId);
            res.status(200).json({
                message: 'Reminders dispatched successfully to non-respondents',
                result,
                dispatchedCount: result.dispatchedCount,
            });
        }
        catch (err) {
            if (err.message && (err.message.includes('not found') || err.message.includes('Cannot send reminders'))) {
                next(new error_middleware_1.AppError(400, err.message, 'https://tesp-api.talnova.io/errors/invalid-action'));
                return;
            }
            next(err);
        }
    };
    generateKioskPins = async (req, res, next) => {
        try {
            const { campaignId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const count = Number(req.body.count) || 6;
            if (!this.generateKioskPinsUseCase) {
                throw new error_middleware_1.AppError(500, 'GenerateKioskPinsUseCase is not initialized');
            }
            const pins = await this.generateKioskPinsUseCase.execute(projectId, campaignId, count);
            event_bus_1.DomainEventBus.getInstance().publish({
                eventId: crypto_1.default.randomUUID(),
                eventType: 'KIOSK_PINS_GENERATED',
                aggregateId: campaignId,
                timestamp: new Date(),
                payload: {
                    projectId,
                    campaignId,
                    count: pins.length,
                    actorId: req.user?.userId || 'USR-ADMIN',
                    actorRole: req.user?.role || 'PROJECT_ADMIN',
                },
            });
            res.status(200).json(pins);
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message, 'https://tesp-api.talnova.io/errors/not-found'));
                return;
            }
            next(err);
        }
    };
    validateTokenOnly = async (req, res, next) => {
        try {
            const { token } = req.params;
            const result = await this.validateAndBurnTokenUseCase.validateToken(token);
            if (!result.valid) {
                res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/invalid-token',
                    title: 'Forbidden',
                    status: 403,
                    detail: result.error || 'Token is invalid or expired',
                });
                return;
            }
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    validateAndBurnToken = async (req, res, next) => {
        try {
            const { token } = req.params;
            const action = req.query.action;
            if (action === 'validate') {
                const result = await this.validateAndBurnTokenUseCase.validateToken(token);
                if (!result.valid) {
                    res.status(403).json({
                        type: 'https://tesp-api.talnova.io/errors/invalid-token',
                        title: 'Forbidden',
                        status: 403,
                        detail: result.error || 'Token is invalid or expired',
                    });
                    return;
                }
                res.status(200).json(result);
                return;
            }
            const result = await this.validateAndBurnTokenUseCase.burnToken(token);
            if (!result.valid) {
                res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/invalid-token',
                    title: 'Forbidden',
                    status: 403,
                    detail: result.error || 'Token is invalid or expired',
                });
                return;
            }
            event_bus_1.DomainEventBus.getInstance().publish({
                eventId: crypto_1.default.randomUUID(),
                eventType: 'TOKEN_BURNED',
                aggregateId: token,
                timestamp: new Date(),
                payload: {
                    token,
                    burnedAt: new Date().toISOString(),
                    actorId: 'SURVEY_RESPONDENT',
                    actorRole: 'SURVEY_RESPONDENT',
                },
            });
            res.status(200).json({
                message: 'Token validated and burned successfully',
                result,
            });
        }
        catch (err) {
            next(err);
        }
    };
    async verifyWebhookSignature(req) {
        // In non-production environments, allow signature bypass ONLY if explicit bypass header is provided
        if (process.env.NODE_ENV !== 'production' && req.headers['x-bypass-webhook-verification'] === 'true') {
            return true;
        }
        const isAwsSes = req.path.includes('aws-ses') || req.originalUrl.includes('aws-ses');
        const isTwilio = req.path.includes('twilio') || req.originalUrl.includes('twilio');
        if (isAwsSes) {
            // Allow configured AWS webhook secret token
            const webhookSecret = process.env.AWS_SES_WEBHOOK_SECRET;
            const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
            if (webhookSecret && providedSecret === webhookSecret) {
                return true;
            }
            const body = req.body || {};
            return await (0, webhook_signature_verifier_1.verifySnsSignature)(body);
        }
        if (isTwilio) {
            const webhookSecret = process.env.TWILIO_WEBHOOK_SECRET;
            const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
            if (webhookSecret && providedSecret === webhookSecret) {
                return true;
            }
            return (0, webhook_signature_verifier_1.verifyTwilioSignature)(req, process.env.TWILIO_AUTH_TOKEN);
        }
        return false;
    }
    handleWebhook = async (req, res, next) => {
        try {
            const isVerified = await this.verifyWebhookSignature(req);
            if (!isVerified) {
                throw new error_middleware_1.AppError(401, 'Unauthorized: Webhook signature verification failed or signature missing', 'https://tesp-api.talnova.io/errors/unauthorized');
            }
            const parsed = campaign_dto_1.WebhookPayloadDtoSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const result = await this.handleDeliveryWebhookUseCase.execute(parsed.data);
            const isUpdated = typeof result === 'boolean' ? result : result.updated;
            res.status(200).json({
                received: true,
                updated: isUpdated,
                ...(typeof result === 'object' ? result : {}),
            });
        }
        catch (err) {
            next(err);
        }
    };
    getOptimalDispatchTime = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const nodeId = req.query.nodeId;
            const result = await this.getOptimalDispatchTimeUseCase.execute(projectId, nodeId);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getKioskRoster = async (req, res, next) => {
        try {
            const { campaignId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const nodeId = req.query.nodeId;
            const format = req.query.format;
            if (!this.getCampaignKioskRosterUseCase) {
                throw new error_middleware_1.AppError(500, 'GetCampaignKioskRosterUseCase is not initialized');
            }
            const result = await this.getCampaignKioskRosterUseCase.execute(projectId, campaignId, nodeId);
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="kiosk-roster-${campaignId}.csv"`);
                res.status(200).send(result.csvContent);
                return;
            }
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message, 'https://tesp-api.talnova.io/errors/not-found'));
                return;
            }
            next(err);
        }
    };
    getMySurveys = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const employeeId = req.user?.employeeId ||
                (req.user?.role === auth_middleware_1.UserRole.SURVEY_RESPONDENT || req.user?.role === 'EMPLOYEE'
                    ? req.user?.userId
                    : undefined);
            const email = req.user?.email;
            if (!this.getMySurveysUseCase) {
                throw new error_middleware_1.AppError(500, 'GetMySurveysUseCase is not initialized');
            }
            const surveys = await this.getMySurveysUseCase.execute(projectId, employeeId || '', email);
            res.status(200).json({
                success: true,
                data: surveys,
            });
        }
        catch (err) {
            next(err);
        }
    };
    completeCampaign = async (req, res, next) => {
        try {
            const { campaignId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            if (!this.completeCampaignUseCase) {
                throw new error_middleware_1.AppError(500, 'CompleteCampaignUseCase is not initialized');
            }
            const campaign = await this.completeCampaignUseCase.execute(projectId, campaignId);
            res.status(200).json({
                message: `Campaign '${campaignId}' successfully completed`,
                campaign: campaign.toJSON(),
            });
        }
        catch (err) {
            next(err);
        }
    };
    deleteCampaign = async (req, res, next) => {
        try {
            const { campaignId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            if (!this.deleteCampaignUseCase) {
                throw new error_middleware_1.AppError(500, 'DeleteCampaignUseCase is not initialized');
            }
            await this.deleteCampaignUseCase.execute(projectId, campaignId);
            res.status(200).json({
                message: `Campaign '${campaignId}' successfully deleted`,
                campaignId,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.CampaignController = CampaignController;
//# sourceMappingURL=campaign.controller.js.map