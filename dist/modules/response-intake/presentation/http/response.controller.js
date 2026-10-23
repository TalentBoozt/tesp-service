"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseController = void 0;
const submit_response_dto_1 = require("../../application/dto/submit-response.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class ResponseController {
    submitSurveyResponseUseCase;
    getSurveyResponseUseCase;
    listSurveyResponsesUseCase;
    constructor(submitSurveyResponseUseCase, getSurveyResponseUseCase, listSurveyResponsesUseCase) {
        this.submitSurveyResponseUseCase = submitSurveyResponseUseCase;
        this.getSurveyResponseUseCase = getSurveyResponseUseCase;
        this.listSurveyResponsesUseCase = listSurveyResponsesUseCase;
    }
    submitResponse = async (req, res, next) => {
        try {
            const body = { ...req.body };
            if (!body.projectId) {
                body.projectId = req.user?.projectId || 'PRJ-99201';
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
            if (err.message && (err.message.includes('Invalid or used survey token') || err.message.includes('already burned'))) {
                next(new error_middleware_1.AppError(403, err.message, 'https://tesp-api.talnova.io/errors/invalid-token'));
                return;
            }
            if (err.message && (err.message.includes('out of range') || err.message.includes('Unknown question ID') || err.message.includes('Missing required'))) {
                next(new error_middleware_1.AppError(400, err.message, 'https://tesp-api.talnova.io/errors/validation-failed'));
                return;
            }
            next(err);
        }
    };
    getResponse = async (req, res, next) => {
        try {
            const { responseId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
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
            const projectId = req.query.projectId || req.user?.projectId || 'PRJ-DEFAULT';
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