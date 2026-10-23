"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSurveyResponseUseCase = void 0;
class GetSurveyResponseUseCase {
    responseRepo;
    constructor(responseRepo) {
        this.responseRepo = responseRepo;
    }
    async execute(projectId, responseId) {
        const response = await this.responseRepo.findByResponseId(projectId, responseId);
        if (!response) {
            throw new Error(`Survey response '${responseId}' not found`);
        }
        return response;
    }
}
exports.GetSurveyResponseUseCase = GetSurveyResponseUseCase;
//# sourceMappingURL=get-survey-response.use-case.js.map