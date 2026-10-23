import { Request, Response, NextFunction } from 'express';
import { CreateActionPlanUseCase } from '../../application/use-cases/create-action-plan.use-case';
import { TransitionActionPlanStatusUseCase } from '../../application/use-cases/transition-action-plan-status.use-case';
import { GetRecommendedTemplatesUseCase } from '../../application/use-cases/get-recommended-templates.use-case';
import { SyncExternalTaskUseCase } from '../../application/use-cases/sync-external-task.use-case';
import { ListActionPlansUseCase } from '../../application/use-cases/list-action-plans.use-case';
import { GetActionPlanUseCase } from '../../application/use-cases/get-action-plan.use-case';
import { UpdateActionPlanUseCase } from '../../application/use-cases/update-action-plan.use-case';
import { DeleteActionPlanUseCase } from '../../application/use-cases/delete-action-plan.use-case';
export declare class ActionController {
    private createActionPlanUseCase;
    private transitionActionPlanStatusUseCase;
    private getRecommendedTemplatesUseCase;
    private syncExternalTaskUseCase;
    private listActionPlansUseCase;
    private getActionPlanUseCase?;
    private updateActionPlanUseCase?;
    private deleteActionPlanUseCase?;
    constructor(createActionPlanUseCase: CreateActionPlanUseCase, transitionActionPlanStatusUseCase: TransitionActionPlanStatusUseCase, getRecommendedTemplatesUseCase: GetRecommendedTemplatesUseCase, syncExternalTaskUseCase: SyncExternalTaskUseCase, listActionPlansUseCase: ListActionPlansUseCase, getActionPlanUseCase?: GetActionPlanUseCase | undefined, updateActionPlanUseCase?: UpdateActionPlanUseCase | undefined, deleteActionPlanUseCase?: DeleteActionPlanUseCase | undefined);
    createActionPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActionPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateActionPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    toggleMilestone: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteActionPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    transitionStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTemplates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    syncTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getKanban: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
