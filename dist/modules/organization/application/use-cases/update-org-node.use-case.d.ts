import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity } from '../../domain/entities/org-node.entity';
export interface UpdateOrgNodeParams {
    name?: string;
    type?: string;
    displayOrder?: number;
    attributes?: Record<string, any>;
}
export declare class UpdateOrgNodeUseCase {
    private repository;
    constructor(repository: IOrgNodeRepository);
    execute(projectId: string, nodeId: string, params: UpdateOrgNodeParams, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<OrgNodeEntity>;
}
