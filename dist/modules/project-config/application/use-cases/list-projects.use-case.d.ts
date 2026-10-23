import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../domain/entities/project.entity';
export declare class ListProjectsUseCase {
    private repository;
    constructor(repository: IProjectRepository);
    execute(options?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        projects: ProjectEntity[];
        total: number;
    }>;
}
