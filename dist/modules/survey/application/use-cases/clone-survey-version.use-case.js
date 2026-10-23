"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneSurveyVersionUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const survey_events_1 = require("../../domain/events/survey.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class CloneSurveyVersionUseCase {
    surveyRepo;
    eventBus;
    constructor(surveyRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.surveyRepo = surveyRepo;
        this.eventBus = eventBus;
    }
    async execute(projectId, surveyId, actorContext) {
        const existing = await this.surveyRepo.findBySurveyId(projectId, surveyId);
        if (!existing || existing.isDeleted) {
            throw new error_middleware_1.AppError(404, `Survey with ID '${surveyId}' was not found.`, 'https://tesp-api.talnova.io/errors/survey-not-found');
        }
        const draftClone = existing.createDraftClone();
        const savedClone = await this.surveyRepo.save(draftClone);
        this.eventBus.publish(new survey_events_1.SurveyClonedEvent(surveyId, {
            projectId,
            surveyId,
            newVersion: savedClone.version,
        }));
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'SURVEY_VERSION_CLONED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/surveys/${surveyId}/clone`,
                details: { newVersion: savedClone.version },
            });
        }
        return savedClone;
    }
}
exports.CloneSurveyVersionUseCase = CloneSurveyVersionUseCase;
//# sourceMappingURL=clone-survey-version.use-case.js.map