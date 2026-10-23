import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
import { IBrandingProps } from '../../domain/value-objects/branding.vo';
import { ICustomAttributeDefinitionProps } from '../../domain/value-objects/custom-attribute.vo';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export interface UpdateProjectParams {
    name?: string;
    branding?: IBrandingProps;
    supportedLocales?: string[];
    defaultLocale?: string;
    customAttributeDefinitions?: ICustomAttributeDefinitionProps[];
}
export declare class UpdateProjectUseCase {
    private repository;
    private cache;
    private eventBus;
    constructor(repository: IProjectRepository, cache: ProjectRedisCache, eventBus?: DomainEventBus);
    execute(projectId: string, params: UpdateProjectParams, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<ProjectEntity>;
}
