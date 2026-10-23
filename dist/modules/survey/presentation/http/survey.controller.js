"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyController = void 0;
const survey_dto_1 = require("../dto/survey.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class SurveyController {
    createSurveyDraftUseCase;
    publishSurveyUseCase;
    cloneSurveyVersionUseCase;
    getSurveyUseCase;
    listSurveysUseCase;
    deleteSurveyUseCase;
    questionLibraryUseCase;
    constructor(createSurveyDraftUseCase, publishSurveyUseCase, cloneSurveyVersionUseCase, getSurveyUseCase, listSurveysUseCase, deleteSurveyUseCase, questionLibraryUseCase) {
        this.createSurveyDraftUseCase = createSurveyDraftUseCase;
        this.publishSurveyUseCase = publishSurveyUseCase;
        this.cloneSurveyVersionUseCase = cloneSurveyVersionUseCase;
        this.getSurveyUseCase = getSurveyUseCase;
        this.listSurveysUseCase = listSurveysUseCase;
        this.deleteSurveyUseCase = deleteSurveyUseCase;
        this.questionLibraryUseCase = questionLibraryUseCase;
    }
    createDraft = async (req, res, next) => {
        try {
            const generatedSurveyId = req.body.surveyId || `SRV-${Math.floor(100000 + Math.random() * 900000)}`;
            const parsed = survey_dto_1.SaveSurveyDraftSchema.safeParse({
                ...req.body,
                surveyId: generatedSurveyId,
            });
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const survey = await this.createSurveyDraftUseCase.execute(parsed.data, actorContext);
            res.status(201).json({ data: survey.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    saveDraft = async (req, res, next) => {
        try {
            const parsed = survey_dto_1.SaveSurveyDraftSchema.safeParse({
                ...req.body,
                surveyId: req.params.surveyId || req.body.surveyId,
            });
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const survey = await this.createSurveyDraftUseCase.execute(parsed.data, actorContext);
            res.status(200).json({ data: survey.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    publishSurvey = async (req, res, next) => {
        try {
            const { surveyId } = req.params;
            const projectId = req.query.projectId || req.body.projectId || req.user?.projectId;
            if (!projectId) {
                throw new error_middleware_1.AppError(400, 'projectId parameter is required');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const published = await this.publishSurveyUseCase.execute(projectId, surveyId, actorContext);
            res.status(200).json({ data: published.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    cloneSurvey = async (req, res, next) => {
        try {
            const { surveyId } = req.params;
            const projectId = req.query.projectId || req.body.projectId || req.user?.projectId;
            if (!projectId) {
                throw new error_middleware_1.AppError(400, 'projectId parameter is required');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const clone = await this.cloneSurveyVersionUseCase.execute(projectId, surveyId, actorContext);
            res.status(201).json({ data: clone.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    getSurvey = async (req, res, next) => {
        try {
            const { surveyId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId;
            if (!projectId) {
                throw new error_middleware_1.AppError(400, 'projectId parameter is required');
            }
            const version = req.query.version ? parseInt(req.query.version, 10) : undefined;
            const survey = await this.getSurveyUseCase.execute(projectId, surveyId, version);
            res.status(200).json({ data: survey.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    listSurveys = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId;
            if (!projectId) {
                throw new error_middleware_1.AppError(400, 'projectId query parameter is required');
            }
            const status = req.query.status;
            const surveys = await this.listSurveysUseCase.execute(projectId, { status });
            res.status(200).json({ data: surveys.map((s) => s.toJSON()), meta: { count: surveys.length } });
        }
        catch (err) {
            next(err);
        }
    };
    deleteSurvey = async (req, res, next) => {
        try {
            const { surveyId } = req.params;
            const projectId = req.query.projectId || req.user?.projectId;
            if (!projectId) {
                throw new error_middleware_1.AppError(400, 'projectId query parameter is required');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            await this.deleteSurveyUseCase.execute(projectId, surveyId, actorContext);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
    saveLibraryItem = async (req, res, next) => {
        try {
            const parsed = survey_dto_1.QuestionLibrarySchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const item = await this.questionLibraryUseCase.saveItem(parsed.data);
            res.status(201).json({ data: item.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    getLibraryItems = async (req, res, next) => {
        try {
            const projectId = req.query.projectId || req.user?.projectId;
            if (!projectId) {
                throw new error_middleware_1.AppError(400, 'projectId query parameter is required');
            }
            const category = req.query.category;
            const items = await this.questionLibraryUseCase.findItems(projectId, category);
            res.status(200).json({ data: items.map((i) => i.toJSON()), meta: { count: items.length } });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.SurveyController = SurveyController;
//# sourceMappingURL=survey.controller.js.map