import { Request, Response, NextFunction } from 'express';
import { ListEngagementsUseCase, GetBenchmarksUseCase, CreateWorkshopUseCase, UpdateWorkshopUseCase, DeleteWorkshopUseCase, ListWorkshopsUseCase, GetSignoffQueueUseCase, SignoffAiFindingUseCase, GetAiThemesUseCase } from '../../application/use-cases/consultant.use-cases';
import { MongoConsultingFirmRepository } from '../../infrastructure/persistence/mongoose/mongo-consulting-firm.repository';
export declare class ConsultantController {
    private listEngagementsUseCase;
    private getBenchmarksUseCase;
    private createWorkshopUseCase;
    private listWorkshopsUseCase;
    private getSignoffQueueUseCase;
    private signoffAiFindingUseCase;
    private updateWorkshopUseCase;
    private deleteWorkshopUseCase;
    private getAiThemesUseCase;
    private firmRepo;
    constructor(listEngagementsUseCase: ListEngagementsUseCase, getBenchmarksUseCase: GetBenchmarksUseCase, createWorkshopUseCase: CreateWorkshopUseCase, listWorkshopsUseCase: ListWorkshopsUseCase, getSignoffQueueUseCase: GetSignoffQueueUseCase, signoffAiFindingUseCase: SignoffAiFindingUseCase, updateWorkshopUseCase?: UpdateWorkshopUseCase, deleteWorkshopUseCase?: DeleteWorkshopUseCase, getAiThemesUseCase?: GetAiThemesUseCase, firmRepo?: MongoConsultingFirmRepository);
    private resolveFirmContext;
    private enrichEngagementMetrics;
    getEngagements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBenchmarks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getWorkshops: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createWorkshop: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getWorkspace: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateWorkshop: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteWorkshop: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAiThemes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSignoffQueue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    signoffAiFinding: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
