"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProjectUseCase = void 0;
const project_entity_1 = require("../../domain/entities/project.entity");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetProjectUseCase {
    repository;
    cache;
    constructor(repository, cache) {
        this.repository = repository;
        this.cache = cache;
    }
    async execute(projectId) {
        // 1. Try fetching from Redis cache
        const cached = await this.cache.get(projectId);
        if (cached) {
            return new project_entity_1.ProjectEntity(cached);
        }
        // 2. Fetch from MongoDB
        const project = await this.repository.findByProjectId(projectId);
        if (!project || project.isDeleted) {
            throw new error_middleware_1.AppError(404, `Project with ID '${projectId}' was not found or has been archived.`, 'https://tesp-api.talnova.io/errors/project-not-found');
        }
        // 3. Set Redis cache
        await this.cache.set(project.projectId, project.toJSON());
        return project;
    }
}
exports.GetProjectUseCase = GetProjectUseCase;
//# sourceMappingURL=get-project.use-case.js.map