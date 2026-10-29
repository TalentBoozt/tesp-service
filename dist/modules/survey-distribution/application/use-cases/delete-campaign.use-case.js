"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCampaignUseCase = void 0;
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class DeleteCampaignUseCase {
    campaignRepo;
    constructor(campaignRepo) {
        this.campaignRepo = campaignRepo;
    }
    async execute(projectId, campaignId) {
        const campaign = await this.campaignRepo.findByCampaignId(projectId, campaignId);
        if (!campaign) {
            throw new error_middleware_1.AppError(404, `Campaign '${campaignId}' not found for project '${projectId}'`);
        }
        // Business Rule: Active running campaigns cannot be deleted!
        if (campaign.status === campaign_entity_1.CampaignStatus.ACTIVE) {
            throw new error_middleware_1.AppError(400, `Cannot delete active running campaign '${campaignId}'. Please force-complete or cancel the campaign before deleting.`);
        }
        return await this.campaignRepo.softDelete(projectId, campaignId);
    }
}
exports.DeleteCampaignUseCase = DeleteCampaignUseCase;
//# sourceMappingURL=delete-campaign.use-case.js.map