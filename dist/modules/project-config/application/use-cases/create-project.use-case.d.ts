import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectEntity, IProjectProps } from '../../domain/entities/project.entity';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class CreateProjectUseCase {
    private repository;
    private cache;
    private eventBus;
    constructor(repository: IProjectRepository, cache: ProjectRedisCache, eventBus?: DomainEventBus);
    execute(props: IProjectProps, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<ProjectEntity>;
}
