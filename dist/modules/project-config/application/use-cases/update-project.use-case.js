"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const project_events_1 = require("../../domain/events/project-events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class UpdateProjectUseCase {
    repository;
    cache;
    eventBus;
    constructor(repository, cache, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.cache = cache;
        this.eventBus = eventBus;
    }
    async execute(projectId, params, actorContext) {
        const project = await this.repository.findByProjectId(projectId);
        if (!project || project.isDeleted) {
            throw new error_middleware_1.AppError(404, `Project with ID '${projectId}' was not found.`, 'https://tesp-api.talnova.io/errors/project-not-found');
        }
        // Apply updates (increments version)
        project.updateDetails(params);
        const saved = await this.repository.save(project);
        // Evict and update Redis Cache
        await this.cache.evict(projectId);
        await this.cache.set(projectId, saved.toJSON());
        // Publish Event
        this.eventBus.publish(new project_events_1.ProjectUpdatedEvent(projectId, saved.toJSON()));
        // Audit Log
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId,
                action: 'PROJECT_UPDATED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/projects/${projectId}`,
                details: { version: saved.version, fieldsUpdated: Object.keys(params) },
            });
        }
        return saved;
    }
}
exports.UpdateProjectUseCase = UpdateProjectUseCase;
//# sourceMappingURL=update-project.use-case.js.map