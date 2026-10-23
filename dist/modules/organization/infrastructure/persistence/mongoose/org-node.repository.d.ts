import { IOrgNodeRepository } from '../../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity } from '../../../domain/entities/org-node.entity';
export declare class OrgNodeMongoRepository implements IOrgNodeRepository {
    private toEntity;
    save(node: OrgNodeEntity): Promise<OrgNodeEntity>;
    findByNodeId(projectId: string, nodeId: string): Promise<OrgNodeEntity | null>;
    findSubTree(projectId: string, basePath: string): Promise<OrgNodeEntity[]>;
    findAncestors(projectId: string, nodePath: string): Promise<OrgNodeEntity[]>;
    findAllByProject(projectId: string, options?: {
        parentId?: string | null;
        type?: string;
    }): Promise<OrgNodeEntity[]>;
    existsByNodeId(projectId: string, nodeId: string): Promise<boolean>;
    hasActiveChildren(projectId: string, nodeId: string): Promise<boolean>;
    bulkUpdateSubTreePaths(projectId: string, oldPrefix: string, newPrefix: string): Promise<number>;
    softDelete(projectId: string, nodeId: string): Promise<boolean>;
}
