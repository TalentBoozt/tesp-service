"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantiateSurveyTemplateUseCase = void 0;
const survey_template_repository_1 = require("../../infrastructure/persistence/mongoose/survey-template.repository");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class InstantiateSurveyTemplateUseCase {
    templateRepo;
    createDraftUseCase;
    constructor(templateRepo = new survey_template_repository_1.SurveyTemplateMongoRepository(), createDraftUseCase) {
        this.templateRepo = templateRepo;
        this.createDraftUseCase = createDraftUseCase;
    }
    async execute(input, actorContext) {
        const template = await this.templateRepo.findByTemplateId(input.templateId);
        if (!template) {
            throw new error_middleware_1.AppError(404, `Survey template '${input.templateId}' not found.`, 'https://tesp-api.talnova.io/errors/template-not-found');
        }
        let titleRecord;
        if (typeof input.title === 'object' && input.title !== null) {
            titleRecord = input.title;
        }
        else {
            const templateNameRecord = typeof template.name === 'object' && template.name !== null
                ? template.name
                : { 'en-US': String(template.name || '') };
            titleRecord = {
                ...templateNameRecord,
                'en-US': input.title.trim(),
            };
        }
        let descriptionRecord;
        if (typeof input.description === 'object' && input.description !== null) {
            descriptionRecord = input.description;
        }
        else {
            const templateDescRecord = typeof template.description === 'object' && template.description !== null
                ? template.description
                : { 'en-US': String(template.description || '') };
            descriptionRecord = {
                ...templateDescRecord,
                'en-US': input.description ? input.description.trim() : (templateDescRecord['en-US'] || ''),
            };
        }
        // Deep clone pages from template
        const clonedPages = JSON.parse(JSON.stringify(template.pages || []));
        const surveyDraftProps = {
            projectId: input.projectId,
            surveyId: input.surveyId.trim().toUpperCase(),
            version: 1,
            title: titleRecord,
            description: descriptionRecord,
            status: 'DRAFT',
            pages: clonedPages,
        };
        return await this.createDraftUseCase.execute(surveyDraftProps, actorContext);
    }
}
exports.InstantiateSurveyTemplateUseCase = InstantiateSurveyTemplateUseCase;
//# sourceMappingURL=instantiate-survey-template.use-case.js.map