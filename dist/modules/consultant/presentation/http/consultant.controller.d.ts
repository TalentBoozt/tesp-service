import { Request, Response, NextFunction } from 'express';
import { ListEngagementsUseCase, GetBenchmarksUseCase, CreateWorkshopUseCase, ListWorkshopsUseCase, GetSignoffQueueUseCase, SignoffAiFindingUseCase } from '../../application/use-cases/consultant.use-cases';
export declare class ConsultantController {
    private listEngagementsUseCase;
    private getBenchmarksUseCase;
    private createWorkshopUseCase;
    private listWorkshopsUseCase;
    private getSignoffQueueUseCase;
    private signoffAiFindingUseCase;
    constructor(listEngagementsUseCase: ListEngagementsUseCase, getBenchmarksUseCase: GetBenchmarksUseCase, createWorkshopUseCase: CreateWorkshopUseCase, listWorkshopsUseCase: ListWorkshopsUseCase, getSignoffQueueUseCase: GetSignoffQueueUseCase, signoffAiFindingUseCase: SignoffAiFindingUseCase);
    getEngagements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBenchmarks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getWorkshops: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createWorkshop: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSignoffQueue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    signoffAiFinding: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
