"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectUseCase = void 0;
const project_entity_1 = require("../../domain/entities/project.entity");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const project_events_1 = require("../../domain/events/project-events");
const audit_logger_1 = require("../../../../shared/infrastructure/audit/audit-logger");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class CreateProjectUseCase {
    repository;
    cache;
    eventBus;
    constructor(repository, cache, eventBus = event_bus_1.DomainEventBus.getInstance()) {
        this.repository = repository;
        this.cache = cache;
        this.eventBus = eventBus;
    }
    async execute(props, actorContext) {
        const exists = await this.repository.existsByProjectId(props.projectId);
        if (exists) {
            throw new error_middleware_1.AppError(400, `Project with ID '${props.projectId}' already exists.`, 'https://tesp-api.talnova.io/errors/duplicate-project');
        }
        const project = new project_entity_1.ProjectEntity(props);
        const savedProject = await this.repository.save(project);
        // Warm up Redis Cache
        await this.cache.set(savedProject.projectId, savedProject.toJSON());
        // Publish Domain Event
        this.eventBus.publish(new project_events_1.ProjectCreatedEvent(savedProject.projectId, savedProject.toJSON()));
        // Log Audit Entry
        if (actorContext) {
            await audit_logger_1.AuditLogger.log({
                projectId: savedProject.projectId,
                action: 'PROJECT_PROVISIONED',
                actorId: actorContext.actorId,
                actorRole: actorContext.actorRole,
                resource: `/api/v1/projects/${savedProject.projectId}`,
                details: { name: savedProject.name, defaultLocale: savedProject.defaultLocale },
            });
        }
        return savedProject;
    }
}
exports.CreateProjectUseCase = CreateProjectUseCase;
//# sourceMappingURL=create-project.use-case.js.map