"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSurveyTemplatesUseCase = void 0;
const survey_template_repository_1 = require("../../infrastructure/persistence/mongoose/survey-template.repository");
class ListSurveyTemplatesUseCase {
    templateRepo;
    constructor(templateRepo = new survey_template_repository_1.SurveyTemplateMongoRepository()) {
        this.templateRepo = templateRepo;
    }
    async execute(options) {
        return await this.templateRepo.findAll(options);
    }
}
exports.ListSurveyTemplatesUseCase = ListSurveyTemplatesUseCase;
//# sourceMappingURL=list-survey-templates.use-case.js.map