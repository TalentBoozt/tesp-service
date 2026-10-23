"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProjectUseCase = void 0;
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const project_events_1 = require("../../domain/events/project-events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class DeleteProjectUseCase {
    repository;
    cache;
    eventBus;
    constructor(repository, cache, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.cache = cache;
        this.eventBus = eventBus;
    }
    async execute(projectId, actorContext) {
        const project = await this.repository.findByProjectId(projectId);
        if (!project || project.isDeleted) {
            throw new error_middleware_1.AppError(404, `Project with ID '${projectId}' was not found.`, 'https://tesp-api.talnova.io/errors/project-not-found');
        }
        const success = await this.repository.softDelete(projectId);
        if (success) {
            await this.cache.evict(projectId);
            this.eventBus.publish(new project_events_1.ProjectUpdatedEvent(projectId, { isDeleted: true, status: 'ARCHIVED' }));
            if (actorContext) {
                await audit_logger_1.AuditLogger.log({
                    projectId,
                    action: 'PROJECT_ARCHIVED_SOFT_DELETED',
                    actorId: actorContext.actorId,
                    actorRole: actorContext.actorRole,
                    resource: `/api/v1/projects/${projectId}`,
                });
            }
        }
        return success;
    }
}
exports.DeleteProjectUseCase = DeleteProjectUseCase;
//# sourceMappingURL=delete-project.use-case.js.map