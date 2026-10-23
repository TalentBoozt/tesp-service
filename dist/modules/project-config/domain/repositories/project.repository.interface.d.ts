import { ProjectEntity } from '../entities/project.entity';
export interface IProjectRepository {
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
