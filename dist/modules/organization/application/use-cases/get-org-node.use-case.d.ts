import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity } from '../../domain/entities/org-node.entity';
export declare class GetOrgNodeUseCase {
    private repository;
    constructor(repository: IOrgNodeRepository);
    execute(projectId: string, nodeId: string): Promise<OrgNodeEntity>;
}
