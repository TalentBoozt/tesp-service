import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity } from '../../domain/entities/org-node.entity';
export declare class ListOrgNodesUseCase {
    private repository;
    constructor(repository: IOrgNodeRepository);
    execute(projectId: string, options?: {
        parentId?: string | null;
        type?: string;
    }): Promise<OrgNodeEntity[]>;
}
