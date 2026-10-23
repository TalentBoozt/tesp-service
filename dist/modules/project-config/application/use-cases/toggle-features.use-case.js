"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleFeaturesUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const project_events_1 = require("../../domain/events/project-events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class ToggleFeaturesUseCase {
    repository;
    cache;
    eventBus;
    constructor(repository, cache, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.cache = cache;
        this.eventBus = eventBus;
    }
    async execute(projectId, featureFlags, actorContext) {
        const project = await this.repository.findByProjectId(projectId);
        if (!project || project.isDeleted) {
            throw new error_middleware_1.AppError(404, `Project with ID '${projectId}' was not found.`, 'https://tesp-api.talnova.io/errors/project-not-found');
        }
        project.toggleFeatures(featureFlags);
        const saved = await this.repository.save(project);
        // Evict & refresh cache
        await this.cache.evict(projectId);
        await this.cache.set(projectId, saved.toJSON());
        // Publish Event
        this.eventBus.publish(new project_events_1.ProjectUpdatedEvent(projectId, { features: saved.features.toJSON() }));
        // Audit log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'PROJECT_FEATURE_FLAGS_TOGGLED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/projects/${projectId}/features`,
                details: featureFlags,
            });
        }
        return saved;
    }
}
exports.ToggleFeaturesUseCase = ToggleFeaturesUseCase;
//# sourceMappingURL=toggle-features.use-case.js.map