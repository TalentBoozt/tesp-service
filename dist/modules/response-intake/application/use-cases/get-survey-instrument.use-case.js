"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSurveyInstrumentUseCase = void 0;
const campaign_entity_1 = require("../../../survey-distribution/domain/entities/campaign.entity");
const tenant_context_required_error_1 = require("../../../../shared/domain/errors/tenant-context-required.error");
class GetSurveyInstrumentUseCase {
    surveyRepo;
    campaignRepo;
    tokenValidator;
    constructor(surveyRepo, campaignRepo, tokenValidator) {
        this.surveyRepo = surveyRepo;
        this.campaignRepo = campaignRepo;
        this.tokenValidator = tokenValidator;
    }
    async execute(params) {
        let projectId = params.projectId;
        let campaignId = params.campaignId;
        let surveyId;
        let surveyVersion = 1;
        let anonymityLevel = 'SEMI_ANONYMOUS';
        // 1. Resolve via Token if provided
        if (params.token) {
            if (!this.tokenValidator) {
                throw new Error('Token validator service unavailable');
            }
            const tokenResult = await this.tokenValidator.validateToken(params.token);
            if (!tokenResult.valid) {
                throw new Error(`Invalid or expired survey token: ${tokenResult.error || 'Token not accepted'}`);
            }
            if (tokenResult.payload) {
                projectId = tokenResult.payload.projectId;
                campaignId = tokenResult.payload.campaignId;
                surveyId = tokenResult.payload.surveyId;
                surveyVersion = tokenResult.payload.surveyVersion || 1;
                anonymityLevel = tokenResult.payload.anonymityLevel || anonymityLevel;
            }
        }
        if (!campaignId) {
            throw new Error('Missing required survey token or campaign identifier');
        }
        if (!projectId) {
            throw new tenant_context_required_error_1.TenantContextRequiredError('Tenant project context is required to load survey instrument');
        }
        // 2. Validate Campaign Lifecycle
        let campaign = null;
        if (this.campaignRepo) {
            campaign = await this.campaignRepo.findByCampaignId(projectId, campaignId);
        }
        if (campaign) {
            projectId = campaign.projectId;
            surveyId = campaign.surveyId;
            surveyVersion = campaign.surveyVersion;
            anonymityLevel = campaign.anonymityLevel;
            if (campaign.status !== campaign_entity_1.CampaignStatus.ACTIVE) {
                throw new Error(`Survey campaign '${campaignId}' is not accepting responses (Status: ${campaign.status})`);
            }
            const now = Date.now();
            if (campaign.startDate && now < new Date(campaign.startDate).getTime()) {
                throw new Error(`Survey campaign '${campaignId}' has not opened yet (Starts: ${new Date(campaign.startDate).toISOString()})`);
            }
            if (campaign.expirationDate && now > new Date(campaign.expirationDate).getTime()) {
                throw new Error(`Survey campaign '${campaignId}' has expired (Closed on ${new Date(campaign.expirationDate).toISOString()})`);
            }
        }
        if (!surveyId || !projectId) {
            throw new Error(`Unable to resolve survey instrument for campaign '${campaignId}'`);
        }
        // 3. Resolve Survey AST Schema from surveyRepo
        const survey = await this.surveyRepo.findBySurveyId(projectId, surveyId, surveyVersion);
        if (!survey) {
            throw new Error(`Survey instrument '${surveyId}' version ${surveyVersion} not found`);
        }
        return {
            surveyId: survey.surveyId,
            title: survey.title,
            description: survey.description,
            version: survey.version,
            pages: survey.pages || [],
            campaignId,
            projectId,
            anonymityLevel,
            startDate: campaign?.startDate ? new Date(campaign.startDate).toISOString() : undefined,
            expirationDate: campaign?.expirationDate ? new Date(campaign.expirationDate).toISOString() : undefined,
            status: campaign?.status || 'ACTIVE',
        };
    }
}
exports.GetSurveyInstrumentUseCase = GetSurveyInstrumentUseCase;
//# sourceMappingURL=get-survey-instrument.use-case.js.map