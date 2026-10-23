import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
export interface PublicThemeDTO {
    projectId: string;
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    defaultLocale: string;
}
export declare class GetPublicThemeUseCase {
    private repository;
    private cache;
    constructor(repository: IProjectRepository, cache: ProjectRedisCache);
    execute(projectId: string): Promise<PublicThemeDTO>;
}
