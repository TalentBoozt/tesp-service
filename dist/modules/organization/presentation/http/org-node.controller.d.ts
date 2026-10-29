import { Request, Response, NextFunction } from 'express';
import { CreateOrgNodeUseCase } from '../../application/use-cases/create-org-node.use-case';
import { MoveOrgNodeUseCase } from '../../application/use-cases/move-org-node.use-case';
import { GetOrgNodeUseCase } from '../../application/use-cases/get-org-node.use-case';
import { GetSubTreeUseCase } from '../../application/use-cases/get-sub-tree.use-case';
import { GetAncestorsUseCase } from '../../application/use-cases/get-ancestors.use-case';
import { UpdateOrgNodeUseCase } from '../../application/use-cases/update-org-node.use-case';
import { DeleteOrgNodeUseCase } from '../../application/use-cases/delete-org-node.use-case';
import { ListOrgNodesUseCase } from '../../application/use-cases/list-org-nodes.use-case';
export declare class OrgNodeController {
    private createOrgNodeUseCase;
    private moveOrgNodeUseCase;
    private getOrgNodeUseCase;
    private getSubTreeUseCase;
    private getAncestorsUseCase;
    private updateOrgNodeUseCase;
    private deleteOrgNodeUseCase;
    private listOrgNodesUseCase;
    constructor(createOrgNodeUseCase: CreateOrgNodeUseCase, moveOrgNodeUseCase: MoveOrgNodeUseCase, getOrgNodeUseCase: GetOrgNodeUseCase, getSubTreeUseCase: GetSubTreeUseCase, getAncestorsUseCase: GetAncestorsUseCase, updateOrgNodeUseCase: UpdateOrgNodeUseCase, deleteOrgNodeUseCase: DeleteOrgNodeUseCase, listOrgNodesUseCase: ListOrgNodesUseCase);
    private enforceTenantAccess;
    createNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    moveNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubTree: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAncestors: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listNodes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
