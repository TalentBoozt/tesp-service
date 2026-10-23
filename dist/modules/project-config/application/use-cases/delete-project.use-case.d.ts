import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class DeleteProjectUseCase {
    private repository;
    private cache;
    private eventBus;
    constructor(repository: IProjectRepository, cache: ProjectRedisCache, eventBus?: DomainEventBus);
    execute(projectId: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<boolean>;
}
