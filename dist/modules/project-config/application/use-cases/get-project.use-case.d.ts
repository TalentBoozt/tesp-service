import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
export declare class GetProjectUseCase {
    private repository;
    private cache;
    constructor(repository: IProjectRepository, cache: ProjectRedisCache);
    execute(projectId: string): Promise<ProjectEntity>;
}
