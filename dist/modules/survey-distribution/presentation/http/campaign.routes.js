"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaignRouter = createCampaignRouter;
const express_1 = require("express");
const campaign_repository_1 = require("../../infrastructure/persistence/mongoose/campaign.repository");
const token_vault_repository_1 = require("../../infrastructure/persistence/mongoose/token-vault.repository");
const redis_token_repository_1 = require("../../infrastructure/cache/redis-token.repository");
const token_vault_schema_1 = require("../../infrastructure/persistence/mongoose/token-vault.schema");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
const launch_campaign_use_case_1 = require("../../application/use-cases/launch-campaign.use-case");
const get_campaign_metrics_use_case_1 = require("../../application/use-cases/get-campaign-metrics.use-case");
const list_campaigns_use_case_1 = require("../../application/use-cases/list-campaigns.use-case");
const dispatch_reminders_use_case_1 = require("../../application/use-cases/dispatch-reminders.use-case");
const validate_and_burn_token_use_case_1 = require("../../application/use-cases/validate-and-burn-token.use-case");
const handle_delivery_webhook_use_case_1 = require("../../application/use-cases/handle-delivery-webhook.use-case");
const get_optimal_dispatch_time_use_case_1 = require("../../application/use-cases/get-optimal-dispatch-time.use-case");
const generate_kiosk_pins_use_case_1 = require("../../application/use-cases/generate-kiosk-pins.use-case");
const get_campaign_kiosk_roster_use_case_1 = require("../../application/use-cases/get-campaign-kiosk-roster.use-case");
const get_my_surveys_use_case_1 = require("../../application/use-cases/get-my-surveys.use-case");
const complete_campaign_use_case_1 = require("../../application/use-cases/complete-campaign.use-case");
const delete_campaign_use_case_1 = require("../../application/use-cases/delete-campaign.use-case");
const campaign_controller_1 = require("./campaign.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const employee_repository_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.repository");
function createCampaignRouter(campaignRepo, vaultRepo, redisRepo, surveyRepo, employeeRepo) {
    const router = (0, express_1.Router)();
    const cRepo = campaignRepo || new campaign_repository_1.SurveyCampaignMongoRepository();
    const vRepo = vaultRepo || new token_vault_repository_1.TokenVaultMongoRepository();
    const rRepo = redisRepo || new redis_token_repository_1.RedisTokenRepository();
    const eRepo = employeeRepo || new employee_repository_1.EmployeeMongoRepository();
    const launchCampaignUseCase = new launch_campaign_use_case_1.LaunchCampaignUseCase(cRepo, vRepo, rRepo, surveyRepo, eRepo);
    const getCampaignMetricsUseCase = new get_campaign_metrics_use_case_1.GetCampaignMetricsUseCase(cRepo, token_vault_schema_1.TokenVaultModel, survey_response_schema_1.SurveyResponseModel);
    const listCampaignsUseCase = new list_campaigns_use_case_1.ListCampaignsUseCase(cRepo);
    const dispatchRemindersUseCase = new dispatch_reminders_use_case_1.DispatchRemindersUseCase(cRepo, vRepo, eRepo);
    const validateAndBurnTokenUseCase = new validate_and_burn_token_use_case_1.ValidateAndBurnTokenUseCase(rRepo, vRepo, cRepo);
    const handleDeliveryWebhookUseCase = new handle_delivery_webhook_use_case_1.HandleDeliveryWebhookUseCase(cRepo);
    const getOptimalDispatchTimeUseCase = new get_optimal_dispatch_time_use_case_1.GetOptimalDispatchTimeUseCase();
    const generateKioskPinsUseCase = new generate_kiosk_pins_use_case_1.GenerateKioskPinsUseCase(vRepo, cRepo, rRepo);
    const getCampaignKioskRosterUseCase = new get_campaign_kiosk_roster_use_case_1.GetCampaignKioskRosterUseCase(cRepo, vRepo, employeeRepo);
    const getMySurveysUseCase = new get_my_surveys_use_case_1.GetMySurveysUseCase(cRepo, vRepo);
    const completeCampaignUseCase = new complete_campaign_use_case_1.CompleteCampaignUseCase(cRepo);
    const deleteCampaignUseCase = new delete_campaign_use_case_1.DeleteCampaignUseCase(cRepo);
    const controller = new campaign_controller_1.CampaignController(launchCampaignUseCase, getCampaignMetricsUseCase, listCampaignsUseCase, dispatchRemindersUseCase, validateAndBurnTokenUseCase, handleDeliveryWebhookUseCase, getOptimalDispatchTimeUseCase, generateKioskPinsUseCase, getCampaignKioskRosterUseCase, getMySurveysUseCase, completeCampaignUseCase, deleteCampaignUseCase);
    // Webhooks (Unauthenticated or provider signature validated)
    router.post('/webhooks/aws-ses', controller.handleWebhook);
    router.post('/webhooks/twilio', controller.handleWebhook);
    // Token validate & burn endpoints (Accessible by survey respondent or intake service)
    router.get('/campaigns/tokens/:token/validate', controller.validateTokenOnly);
    router.post('/campaigns/tokens/:token/validate', controller.validateTokenOnly);
    router.post('/campaigns/tokens/:token/burn', controller.validateAndBurnToken);
    // Protected Campaign Management Routes
    router.use('/campaigns', auth_middleware_1.authenticate);
    router.post('/campaigns', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT]), controller.launchCampaign);
    router.get('/campaigns', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER, auth_middleware_1.UserRole.REPORT_VIEWER]), controller.listCampaigns);
    // Active Surveys for Authenticated Employee / Ground Worker (Portal 1-Click & PIN)
    router.get('/campaigns/my-surveys', controller.getMySurveys);
    router.get('/campaigns/optimal-dispatch-time', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT]), controller.getOptimalDispatchTime);
    router.post('/campaigns/:campaignId/pins', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT]), controller.generateKioskPins);
    router.get('/campaigns/:campaignId/kiosk-roster', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER]), controller.getKioskRoster);
    router.get('/campaigns/:campaignId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER, auth_middleware_1.UserRole.REPORT_VIEWER]), controller.getCampaignMetrics);
    router.get('/campaigns/:campaignId/metrics', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER, auth_middleware_1.UserRole.REPORT_VIEWER]), controller.getCampaignMetrics);
    router.post('/campaigns/:campaignId/remind', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER]), controller.dispatchReminders);
    router.post('/campaigns/:campaignId/complete', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.HR_MANAGER]), controller.completeCampaign);
    router.delete('/campaigns/:campaignId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT]), controller.deleteCampaign);
    return router;
}
//# sourceMappingURL=campaign.routes.js.map