"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSurveyRouter = createSurveyRouter;
const express_1 = require("express");
const survey_repository_1 = require("../../infrastructure/persistence/mongoose/survey.repository");
const create_survey_draft_use_case_1 = require("../../application/use-cases/create-survey-draft.use-case");
const publish_survey_use_case_1 = require("../../application/use-cases/publish-survey.use-case");
const clone_survey_version_use_case_1 = require("../../application/use-cases/clone-survey-version.use-case");
const get_survey_use_case_1 = require("../../application/use-cases/get-survey.use-case");
const list_surveys_use_case_1 = require("../../application/use-cases/list-surveys.use-case");
const delete_survey_use_case_1 = require("../../application/use-cases/delete-survey.use-case");
const question_library_use_case_1 = require("../../application/use-cases/question-library.use-case");
const survey_controller_1 = require("./survey.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createSurveyRouter(surveyRepo) {
    const router = (0, express_1.Router)();
    const repo = surveyRepo || new survey_repository_1.SurveyMongoRepository();
    const createSurveyDraftUseCase = new create_survey_draft_use_case_1.CreateSurveyDraftUseCase(repo);
    const publishSurveyUseCase = new publish_survey_use_case_1.PublishSurveyUseCase(repo);
    const cloneSurveyVersionUseCase = new clone_survey_version_use_case_1.CloneSurveyVersionUseCase(repo);
    const getSurveyUseCase = new get_survey_use_case_1.GetSurveyUseCase(repo);
    const listSurveysUseCase = new list_surveys_use_case_1.ListSurveysUseCase(repo);
    const deleteSurveyUseCase = new delete_survey_use_case_1.DeleteSurveyUseCase(repo);
    const questionLibraryUseCase = new question_library_use_case_1.QuestionLibraryUseCase(repo);
    const controller = new survey_controller_1.SurveyController(createSurveyDraftUseCase, publishSurveyUseCase, cloneSurveyVersionUseCase, getSurveyUseCase, listSurveysUseCase, deleteSurveyUseCase, questionLibraryUseCase);
    router.use(['/surveys', '/question-library', '/survey-templates'], auth_middleware_1.authenticate);
    router.post('/surveys', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.createDraft);
    router.put('/surveys/:surveyId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.saveDraft);
    router.post('/surveys/:surveyId/publish', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.publishSurvey);
    router.post('/surveys/:surveyId/clone', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.cloneSurvey);
    router.get('/surveys', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.listSurveys);
    router.get('/surveys/:surveyId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR, auth_middleware_1.UserRole.SURVEY_RESPONDENT]), controller.getSurvey);
    router.delete('/surveys/:surveyId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN]), controller.deleteSurvey);
    router.post('/question-library', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.saveLibraryItem);
    router.get('/question-library', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.getLibraryItems);
    // Survey Templates Endpoints
    router.get('/survey-templates', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.listTemplates);
    router.get('/survey-templates/:templateId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.getTemplate);
    router.post('/survey-templates/:templateId/instantiate', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.SURVEY_AUTHOR]), controller.instantiateFromTemplate);
    return router;
}
//# sourceMappingURL=survey.routes.js.map