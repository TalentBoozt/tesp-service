"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSurveyTemplateUseCase = void 0;
const survey_template_repository_1 = require("../../infrastructure/persistence/mongoose/survey-template.repository");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetSurveyTemplateUseCase {
    templateRepo;
    constructor(templateRepo = new survey_template_repository_1.SurveyTemplateMongoRepository()) {
        this.templateRepo = templateRepo;
    }
    async execute(templateId) {
        const template = await this.templateRepo.findByTemplateId(templateId);
        if (!template) {
            throw new error_middleware_1.AppError(404, `Survey template '${templateId}' not found.`, 'https://tesp-api.talnova.io/errors/template-not-found');
        }
        return template;
    }
}
exports.GetSurveyTemplateUseCase = GetSurveyTemplateUseCase;
//# sourceMappingURL=get-survey-template.use-case.js.map