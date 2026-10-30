"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponseIntakeRouter = createResponseIntakeRouter;
const express_1 = require("express");
const survey_response_repository_1 = require("../../infrastructure/persistence/mongoose/survey-response.repository");
const submit_survey_response_use_case_1 = require("../../application/use-cases/submit-survey-response.use-case");
const get_survey_response_use_case_1 = require("../../application/use-cases/get-survey-response.use-case");
const list_survey_responses_use_case_1 = require("../../application/use-cases/list-survey-responses.use-case");
const response_controller_1 = require("./response.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const validate_and_burn_token_use_case_1 = require("../../../survey-distribution/application/use-cases/validate-and-burn-token.use-case");
const redis_token_repository_1 = require("../../../survey-distribution/infrastructure/cache/redis-token.repository");
const token_vault_repository_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/token-vault.repository");
const campaign_repository_1 = require("../../../survey-distribution/infrastructure/persistence/mongoose/campaign.repository");
const survey_repository_1 = require("../../../survey/infrastructure/persistence/mongoose/survey.repository");
const get_survey_instrument_use_case_1 = require("../../application/use-cases/get-survey-instrument.use-case");
function createResponseIntakeRouter(responseRepo, tokenBurnUseCase, surveyRepo, campaignRepo) {
    const router = (0, express_1.Router)();
    const rRepo = responseRepo || new survey_response_repository_1.SurveyResponseMongoRepository();
    const cRepo = campaignRepo || (process.env.NODE_ENV === 'test' ? undefined : new campaign_repository_1.SurveyCampaignMongoRepository());
    const tBurnUseCase = tokenBurnUseCase ||
        new validate_and_burn_token_use_case_1.ValidateAndBurnTokenUseCase(new redis_token_repository_1.RedisTokenRepository(), new token_vault_repository_1.TokenVaultMongoRepository(), cRepo);
    const sRepo = surveyRepo || new survey_repository_1.SurveyMongoRepository();
    const submitSurveyResponseUseCase = new submit_survey_response_use_case_1.SubmitSurveyResponseUseCase(rRepo, tBurnUseCase, sRepo, cRepo);
    const getSurveyResponseUseCase = new get_survey_response_use_case_1.GetSurveyResponseUseCase(rRepo);
    const listSurveyResponsesUseCase = new list_survey_responses_use_case_1.ListSurveyResponsesUseCase(rRepo);
    const getSurveyInstrumentUseCase = new get_survey_instrument_use_case_1.GetSurveyInstrumentUseCase(sRepo, cRepo, tBurnUseCase);
    const controller = new response_controller_1.ResponseController(submitSurveyResponseUseCase, getSurveyResponseUseCase, listSurveyResponsesUseCase, getSurveyInstrumentUseCase, tBurnUseCase);
    // Public / Respondent Ingestion & Instrument Resolution Endpoints
    router.get('/intake/instrument', controller.getSurveyInstrument);
    router.get('/responses/instrument', controller.getSurveyInstrument);
    router.post('/responses', controller.submitResponse);
    // Protected Administration & Analytics Routes
    router.get('/responses', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.REPORT_VIEWER]), controller.listResponses);
    router.get('/responses/:responseId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.REPORT_VIEWER]), controller.getResponse);
    return router;
}
//# sourceMappingURL=response.routes.js.map