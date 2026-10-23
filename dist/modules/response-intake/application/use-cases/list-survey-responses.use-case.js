"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSurveyResponsesUseCase = void 0;
class ListSurveyResponsesUseCase {
    responseRepo;
    constructor(responseRepo) {
        this.responseRepo = responseRepo;
    }
    async execute(projectId, campaignId, options) {
        return await this.responseRepo.findAllByCampaign(projectId, campaignId, options);
    }
}
exports.ListSurveyResponsesUseCase = ListSurveyResponsesUseCase;
//# sourceMappingURL=list-survey-responses.use-case.js.map