import { Request, Response, NextFunction } from 'express';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { GetProjectUseCase } from '../../application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { ToggleFeaturesUseCase } from '../../application/use-cases/toggle-features.use-case';
import { GetPublicThemeUseCase } from '../../application/use-cases/get-public-theme.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project.use-case';
export declare class ProjectConfigController {
    private createProjectUseCase;
    private getProjectUseCase;
    private updateProjectUseCase;
    private toggleFeaturesUseCase;
    private getPublicThemeUseCase;
    private listProjectsUseCase;
    private deleteProjectUseCase;
    constructor(createProjectUseCase: CreateProjectUseCase, getProjectUseCase: GetProjectUseCase, updateProjectUseCase: UpdateProjectUseCase, toggleFeaturesUseCase: ToggleFeaturesUseCase, getPublicThemeUseCase: GetPublicThemeUseCase, listProjectsUseCase: ListProjectsUseCase, deleteProjectUseCase: DeleteProjectUseCase);
    createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    toggleFeatures: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicTheme: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listProjects: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
