"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSurveyUseCase = void 0;
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class DeleteSurveyUseCase {
    surveyRepo;
    constructor(surveyRepo) {
        this.surveyRepo = surveyRepo;
    }
    async execute(projectId, surveyId, actorContext) {
        const existing = await this.surveyRepo.findBySurveyId(projectId, surveyId);
        if (!existing || existing.isDeleted) {
            throw new error_middleware_1.AppError(404, `Survey with ID '${surveyId}' was not found.`, 'https://tesp-api.talnova.io/errors/survey-not-found');
        }
        const success = await this.surveyRepo.softDelete(projectId, surveyId);
        if (success && actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'SURVEY_ARCHIVED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/surveys/${surveyId}`,
            });
        }
        return success;
    }
}
exports.DeleteSurveyUseCase = DeleteSurveyUseCase;
//# sourceMappingURL=delete-survey.use-case.js.map