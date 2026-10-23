"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCampaignsUseCase = void 0;
class ListCampaignsUseCase {
    campaignRepo;
    constructor(campaignRepo) {
        this.campaignRepo = campaignRepo;
    }
    async execute(projectId, status) {
        return await this.campaignRepo.findAll(projectId, { status });
    }
}
exports.ListCampaignsUseCase = ListCampaignsUseCase;
//# sourceMappingURL=list-campaigns.use-case.js.map