"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseController = void 0;
const submit_response_dto_1 = require("../../application/dto/submit-response.dto");
const duplicate_submission_exception_1 = require("../../domain/errors/duplicate-submission.exception");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
const campaign_schema_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.schema");
class ResponseController {
    submitSurveyResponseUseCase;
    getSurveyResponseUseCase;
    listSurveyResponsesUseCase;
    getSurveyInstrumentUseCase;
    tokenValidator;
    constructor(submitSurveyResponseUseCase, getSurveyResponseUseCase, listSurveyResponsesUseCase, getSurveyInstrumentUseCase, tokenValidator) {
        this.submitSurveyResponseUseCase = submitSurveyResponseUseCase;
        this.getSurveyResponseUseCase = getSurveyResponseUseCase;
        this.listSurveyResponsesUseCase = listSurveyResponsesUseCase;
        this.getSurveyInstrumentUseCase = getSurveyInstrumentUseCase;
        this.tokenValidator = tokenValidator;
    }
    getSurveyInstrument = async (req, res, next) => {
        try {
            if (!this.getSurveyInstrumentUseCase) {
                throw new error_middleware_1.AppError(500, 'GetSurveyInstrumentUseCase is not configured');
            }
            const token = (req.query.t || req.query.token);
            const campaignId = req.query.campaignId;
            const projectId = req.query.projectId || req.user?.projectId;
            const result = await this.getSurveyInstrumentUseCase.execute({
                token,
                campaignId,
                projectId,
            });
            res.status(200).json(result);
        }
        catch (err) {
            if (err.message && (err.message.includes('Invalid or expired') || err.message.includes('burned'))) {
                next(new error_middleware_1.AppError(403, err.message, 'https://tesp-api.talnova.io/errors/invalid-token'));
                return;
            }
            if (err.message &&
                (err.message.includes('not active') ||
                    err.message.includes('expired') ||
                    err.message.includes('not opened yet') ||
                    err.message.includes('not accepting responses') ||
                    err.message.includes('Missing required survey token'))) {
                next(new error_middleware_1.AppError(400, err.message, 'https://tesp-api.talnova.io/errors/campaign-lifecycle'));
                return;
            }
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message, 'https://tesp-api.talnova.io/errors/not-found'));
                return;
            }
            next(err);
        }
    };
    submitResponse = async (req, res, next) => {
        try {
            const body = { ...req.body };
            // Multi-layer tenant project ID resolution for public & token-authenticated respondents
            if (!body.projectId) {
                // Layer 1: Check request headers or user session
                try {
                    body.projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
                }
                catch {
                    // Expected for unauthenticated public respondents
                }
                // Layer 2: Resolve from token payload (Redis or Mongo Token Vault)
                const token = (body.responseToken || body.participantPin || '').trim();
                if (!body.projectId && token && this.tokenValidator) {
                    try {
                        const tokenResult = await this.tokenValidator.validateToken(token);
                        if (tokenResult.valid && tokenResult.payload?.projectId) {
                            body.projectId = tokenResult.payload.projectId;
                            if (!body.campaignId && tokenResult.payload.campaignId) {
                                body.campaignId = tokenResult.payload.campaignId;
                            }
                            if (!body.surveyId && tokenResult.payload.surveyId) {
                                body.surveyId = tokenResult.payload.surveyId;
                            }
                            if (!body.surveyVersion && tokenResult.payload.surveyVersion) {
                                body.surveyVersion = tokenResult.payload.surveyVersion;
                            }
                        }
                    }
                    catch {
                        // Ignore and try next fallback
                    }
                }
                // Layer 3: Resolve from unique campaign record
                if (!body.projectId && body.campaignId) {
                    try {
                        const camp = await campaign_schema_1.CampaignModel.findOne({ campaignId: body.campaignId }).lean();
                        if (camp && camp.projectId) {
                            body.projectId = camp.projectId;
                            if (!body.surveyId && camp.surveyId) {
                                body.surveyId = camp.surveyId;
                            }
                            if (!body.surveyVersion && camp.surveyVersion) {
                                body.surveyVersion = camp.surveyVersion;
                            }
                        }
                    }
                    catch {
                        // Ignore
                    }
                }
            }
            // If still unresolved, enforce tenant context requirement (throws 400 TenantContextRequiredError)
            if (!body.projectId) {
                body.projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            }
            if (!body.surveyVersion) {
                body.surveyVersion = 1;
            }
            if (!body.respondentType) {
                body.respondentType = body.participantPin ? 'KIOSK' : 'SEMI_ANONYMOUS';
            }
            if (Array.isArray(body.answers)) {
                body.answers = body.answers.map((a) => {
                    if (a.questionType)
                        return a;
                    const isNum = typeof a.value === 'number';
                    const isArr = Array.isArray(a.value);
                    return {
                        questionId: a.questionId,
                        questionType: isNum ? 'RATING' : isArr ? 'MULTI_CHOICE' : 'LONG_TEXT',
                        numericValue: isNum ? a.value : undefined,
                        textValue: typeof a.value === 'string' ? a.value : (!isNum && !isArr && a.value != null ? String(a.value) : undefined),
                        selectedOptions: isArr ? a.value : undefined,
                    };
                });
            }
            const parsed = submit_response_dto_1.SubmitResponseDtoSchema.safeParse(body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const result = await this.submitSurveyResponseUseCase.execute(parsed.data);
            res.status(202).json(result);
        }
        catch (err) {
            if (err instanceof duplicate_submission_exception_1.DuplicateSubmissionException ||
                err.name === 'DuplicateSubmissionException' ||
                (err.message && (err.message.includes('Token has already been consumed') || err.message.includes('already been consumed')))) {
                next(new error_middleware_1.AppError(409, err.message, 'https://tesp-api.talnova.io/errors/duplicate-submission'));
                return;
            }
            if (err.message && (err.message.includes('Invalid or used survey token') || err.message.includes('already burned'))) {
                next(new error_middleware_1.AppError(403, err.message, 'https://tesp-api.talnova.io/errors/invalid-token'));
                return;
            }
            if (err.message &&
                (err.message.includes('out of range') ||
                    err.message.includes('Unknown question ID') ||
                    err.message.includes('Missing required') ||
                    err.message.includes('not active') ||
                    err.message.includes('has expired') ||
                    err.message.includes('has not started') ||
                    (err.message.includes('Campaign') && err.message.includes('not found')))) {
                next(new error_middleware_1.AppError(400, err.message, 'https://tesp-api.talnova.io/errors/validation-failed'));
                return;
            }
            next(err);
        }
    };
    getResponse = async (req, res, next) => {
        try {
            const { responseId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const response = await this.getSurveyResponseUseCase.execute(projectId, responseId);
            res.status(200).json({ response: response.toJSON() });
        }
        catch (err) {
            if (err.message && err.message.includes('not found')) {
                next(new error_middleware_1.AppError(404, err.message, 'https://tesp-api.talnova.io/errors/not-found'));
                return;
            }
            next(err);
        }
    };
    listResponses = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const campaignId = req.query.campaignId;
            if (!campaignId) {
                throw new error_middleware_1.AppError(400, 'campaignId query parameter is required');
            }
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const result = await this.listSurveyResponsesUseCase.execute(projectId, campaignId, { limit, offset });
            res.status(200).json({
                total: result.total,
                responses: result.responses.map((r) => r.toJSON()),
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ResponseController = ResponseController;
//# sourceMappingURL=response.controller.js.map