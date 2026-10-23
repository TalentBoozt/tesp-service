import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
import { IFeatureFlagsProps } from '../../domain/value-objects/feature-flags.vo';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class ToggleFeaturesUseCase {
    private repository;
    private cache;
    private eventBus;
    constructor(repository: IProjectRepository, cache: ProjectRedisCache, eventBus?: DomainEventBus);
    execute(projectId: string, featureFlags: Partial<IFeatureFlagsProps>, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<ProjectEntity>;
}
