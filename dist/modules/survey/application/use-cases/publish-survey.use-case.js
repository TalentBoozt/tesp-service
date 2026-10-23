"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishSurveyUseCase = void 0;
const logic_cycle_guard_1 = require("../../domain/services/logic-cycle.guard");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const survey_events_1 = require("../../domain/events/survey.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class PublishSurveyUseCase {
    surveyRepo;
    eventBus;
    constructor(surveyRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.surveyRepo = surveyRepo;
        this.eventBus = eventBus;
    }
    async execute(projectId, surveyId, actorContext) {
        const survey = await this.surveyRepo.findBySurveyId(projectId, surveyId);
        if (!survey || survey.isDeleted) {
            throw new error_middleware_1.AppError(404, `Survey with ID '${surveyId}' was not found.`, 'https://tesp-api.talnova.io/errors/survey-not-found');
        }
        if (survey.status === 'PUBLISHED' || survey.status === 'ACTIVE') {
            throw new error_middleware_1.AppError(400, `Survey '${surveyId}' version ${survey.version} is already published.`, 'https://tesp-api.talnova.io/errors/already-published');
        }
        // 1. Validate forward skip logic rules
        try {
            logic_cycle_guard_1.LogicCycleGuard.validateForwardOnlySkipLogic(survey.pages);
        }
        catch (err) {
            throw new error_middleware_1.AppError(400, err.message || 'Invalid skip logic in survey', 'https://tesp-api.talnova.io/errors/invalid-skip-logic');
        }
        // 2. Publish survey (validates completeness VR-SRV-002)
        try {
            survey.publish(actorContext?.actorId);
        }
        catch (err) {
            throw new error_middleware_1.AppError(400, err.message || 'Cannot publish survey', 'https://tesp-api.talnova.io/errors/cannot-publish');
        }
        const published = await this.surveyRepo.save(survey);
        // Count questions for event payload
        let questionCount = 0;
        published.pages.forEach((p) => {
            p.sections.forEach((s) => {
                questionCount += s.questions?.length || 0;
            });
        });
        // Event
        this.eventBus.publish(new survey_events_1.SurveyPublishedEvent(surveyId, {
            projectId,
            surveyId,
            version: published.version,
            questionCount,
        }));
        // Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'SURVEY_PUBLISHED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/surveys/${surveyId}/publish`,
                details: { version: published.version, questionCount },
            });
        }
        return published;
    }
}
exports.PublishSurveyUseCase = PublishSurveyUseCase;
//# sourceMappingURL=publish-survey.use-case.js.map