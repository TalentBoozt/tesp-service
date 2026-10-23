import { IProjectRepository } from '../../../domain/repositories/project.repository.interface';
import { ProjectEntity } from '../../../domain/entities/project.entity';
export declare class ProjectMongoRepository implements IProjectRepository {
    private toEntity;
    save(project: ProjectEntity): Promise<ProjectEntity>;
    findByProjectId(projectId: string): Promise<ProjectEntity | null>;
    findAll(options?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        projects: ProjectEntity[];
        total: number;
    }>;
    existsByProjectId(projectId: string): Promise<boolean>;
    softDelete(projectId: string): Promise<boolean>;
}
