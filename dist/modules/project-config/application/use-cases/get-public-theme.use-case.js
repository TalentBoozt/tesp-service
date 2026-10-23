"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPublicThemeUseCase = void 0;
const project_entity_1 = require("../../domain/entities/project.entity");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetPublicThemeUseCase {
    repository;
    cache;
    constructor(repository, cache) {
        this.repository = repository;
        this.cache = cache;
    }
    async execute(projectId) {
        // Fast path: try cache first
        const cached = await this.cache.get(projectId);
        if (cached) {
            const entity = new project_entity_1.ProjectEntity(cached);
            return entity.toPublicThemeDTO();
        }
        // Slow path: fetch from MongoDB & populate cache
        const project = await this.repository.findByProjectId(projectId);
        if (!project || project.isDeleted) {
            throw new error_middleware_1.AppError(404, `Public theme for project '${projectId}' not found.`, 'https://tesp-api.talnova.io/errors/theme-not-found');
        }
        await this.cache.set(projectId, project.toJSON());
        return project.toPublicThemeDTO();
    }
}
exports.GetPublicThemeUseCase = GetPublicThemeUseCase;
//# sourceMappingURL=get-public-theme.use-case.js.map