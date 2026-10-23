"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSurveyUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetSurveyUseCase {
    surveyRepo;
    constructor(surveyRepo) {
        this.surveyRepo = surveyRepo;
    }
    async execute(projectId, surveyId, version) {
        const survey = await this.surveyRepo.findBySurveyId(projectId, surveyId, version);
        if (!survey || survey.isDeleted) {
            throw new error_middleware_1.AppError(404, `Survey with ID '${surveyId}' was not found.`, 'https://tesp-api.talnova.io/errors/survey-not-found');
        }
        return survey;
    }
}
exports.GetSurveyUseCase = GetSurveyUseCase;
//# sourceMappingURL=get-survey.use-case.js.map