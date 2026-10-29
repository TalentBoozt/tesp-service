"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyController = void 0;
const crypto_1 = require("crypto");
const list_survey_templates_use_case_1 = require("../../application/use-cases/list-survey-templates.use-case");
const get_survey_template_use_case_1 = require("../../application/use-cases/get-survey-template.use-case");
const instantiate_survey_template_use_case_1 = require("../../application/use-cases/instantiate-survey-template.use-case");
const survey_dto_1 = require("../dto/survey.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
class SurveyController {
    createSurveyDraftUseCase;
    publishSurveyUseCase;
    cloneSurveyVersionUseCase;
    getSurveyUseCase;
    listSurveysUseCase;
    deleteSurveyUseCase;
    questionLibraryUseCase;
    listSurveyTemplatesUseCase;
    getSurveyTemplateUseCase;
    instantiateSurveyTemplateUseCase;
    constructor(createSurveyDraftUseCase, publishSurveyUseCase, cloneSurveyVersionUseCase, getSurveyUseCase, listSurveysUseCase, deleteSurveyUseCase, questionLibraryUseCase, listSurveyTemplatesUseCase = new list_survey_templates_use_case_1.ListSurveyTemplatesUseCase(), getSurveyTemplateUseCase = new get_survey_template_use_case_1.GetSurveyTemplateUseCase(), instantiateSurveyTemplateUseCase = new instantiate_survey_template_use_case_1.InstantiateSurveyTemplateUseCase(undefined, createSurveyDraftUseCase)) {
        this.createSurveyDraftUseCase = createSurveyDraftUseCase;
        this.publishSurveyUseCase = publishSurveyUseCase;
        this.cloneSurveyVersionUseCase = cloneSurveyVersionUseCase;
        this.getSurveyUseCase = getSurveyUseCase;
        this.listSurveysUseCase = listSurveysUseCase;
        this.deleteSurveyUseCase = deleteSurveyUseCase;
        this.questionLibraryUseCase = questionLibraryUseCase;
        this.listSurveyTemplatesUseCase = listSurveyTemplatesUseCase;
        this.getSurveyTemplateUseCase = getSurveyTemplateUseCase;
        this.instantiateSurveyTemplateUseCase = instantiateSurveyTemplateUseCase;
    }
    createDraft = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req, req.body.projectId);
            const generatedSurveyId = req.body.surveyId || `SRV-${(0, crypto_1.randomUUID)()}`;
            const parsed = survey_dto_1.SaveSurveyDraftSchema.safeParse({
                ...req.body,
                projectId,
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req, req.body.projectId);
            const parsed = survey_dto_1.SaveSurveyDraftSchema.safeParse({
                ...req.body,
                projectId,
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
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
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const category = req.query.category;
            const items = await this.questionLibraryUseCase.findItems(projectId, category);
            res.status(200).json({ data: items.map((i) => i.toJSON()), meta: { count: items.length } });
        }
        catch (err) {
            next(err);
        }
    };
    listTemplates = async (req, res, next) => {
        try {
            let projectId;
            try {
                projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            }
            catch {
                projectId = undefined;
            }
            const category = req.query.category;
            const templates = await this.listSurveyTemplatesUseCase.execute({ category, projectId });
            res.status(200).json({ data: templates, meta: { count: templates.length } });
        }
        catch (err) {
            next(err);
        }
    };
    getTemplate = async (req, res, next) => {
        try {
            const { templateId } = req.params;
            const template = await this.getSurveyTemplateUseCase.execute(templateId);
            res.status(200).json({ data: template });
        }
        catch (err) {
            next(err);
        }
    };
    instantiateFromTemplate = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req, req.body.projectId);
            const parsed = survey_dto_1.InstantiateSurveyTemplateSchema.safeParse({
                ...req.body,
                projectId,
                templateId: req.params.templateId || req.body.templateId,
            });
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const survey = await this.instantiateSurveyTemplateUseCase.execute(parsed.data, actorContext);
            res.status(201).json({ data: survey.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.SurveyController = SurveyController;
//# sourceMappingURL=survey.controller.js.map