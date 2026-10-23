"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSurveysUseCase = void 0;
class ListSurveysUseCase {
    surveyRepo;
    constructor(surveyRepo) {
        this.surveyRepo = surveyRepo;
    }
    async execute(projectId, options) {
        return await this.surveyRepo.findAll(projectId, options);
    }
}
exports.ListSurveysUseCase = ListSurveysUseCase;
//# sourceMappingURL=list-surveys.use-case.js.map