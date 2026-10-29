"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteCampaignUseCase = void 0;
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class CompleteCampaignUseCase {
    campaignRepo;
    constructor(campaignRepo) {
        this.campaignRepo = campaignRepo;
    }
    async execute(projectId, campaignId) {
        const campaign = await this.campaignRepo.findByCampaignId(projectId, campaignId);
        if (!campaign) {
            throw new error_middleware_1.AppError(404, `Campaign '${campaignId}' not found for project '${projectId}'`);
        }
        if (campaign.status === campaign_entity_1.CampaignStatus.COMPLETED) {
            return campaign;
        }
        campaign.forceComplete();
        return await this.campaignRepo.save(campaign);
    }
}
exports.CompleteCampaignUseCase = CompleteCampaignUseCase;
//# sourceMappingURL=complete-campaign.use-case.js.map