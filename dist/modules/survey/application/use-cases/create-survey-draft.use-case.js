"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSurveyDraftUseCase = void 0;
const survey_entity_1 = require("../../domain/entities/survey.entity");
const logic_cycle_guard_1 = require("../../domain/services/logic-cycle.guard");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const survey_events_1 = require("../../domain/events/survey.events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class CreateSurveyDraftUseCase {
    surveyRepo;
    eventBus;
    constructor(surveyRepo, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.surveyRepo = surveyRepo;
        this.eventBus = eventBus;
    }
    async execute(props, actorContext) {
        // 1. Validate forward-only skip logic rules (BR-SRV-004, VR-SRV-003)
        if (props.pages && props.pages.length > 0) {
            try {
                logic_cycle_guard_1.LogicCycleGuard.validateForwardOnlySkipLogic(props.pages);
            }
            catch (err) {
                throw new error_middleware_1.AppError(400, err.message || 'Invalid skip logic rule', 'https://tesp-api.talnova.io/errors/invalid-skip-logic');
            }
        }
        // 2. Check if draft or published version exists
        const existing = await this.surveyRepo.findBySurveyId(props.projectId, props.surveyId, props.version || 1);
        if (existing) {
            // BR-SRV-001 & TC-SRV-001: Active Survey Edit Lock
            if (existing.status === 'PUBLISHED' || existing.status === 'ACTIVE') {
                throw new error_middleware_1.AppError(400, 'Cannot modify structural design of a published survey version. Create a new draft version to edit.', 'https://tesp-api.talnova.io/errors/published-survey-locked');
            }
            existing.updateDraft({
                title: props.title,
                description: props.description,
                pages: props.pages,
            });
            const updated = await this.surveyRepo.save(existing);
            this.eventBus.publish(new survey_events_1.SurveyUpdatedEvent(updated.surveyId, updated.toJSON()));
            if (actorContext) {
                await audit_logger_1.AuditLogger.log({
                    projectId: updated.projectId,
                    action: 'SURVEY_DRAFT_UPDATED',
                    actorId: actorContext.actorId,
                    actorRole: actorContext.actorRole,
                    resource: `/api/v1/surveys/${updated.surveyId}`,
                });
            }
            return updated;
        }
        // Create new draft entity
        const survey = new survey_entity_1.SurveyEntity(props);
        const saved = await this.surveyRepo.save(survey);
        this.eventBus.publish(new survey_events_1.SurveyCreatedEvent(saved.surveyId, saved.toJSON()));
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId: saved.projectId,
                action: 'SURVEY_DRAFT_CREATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/surveys/${saved.surveyId}`,
                details: { version: saved.version, title: saved.title },
            });
        }
        return saved;
    }
}
exports.CreateSurveyDraftUseCase = CreateSurveyDraftUseCase;
//# sourceMappingURL=create-survey-draft.use-case.js.map