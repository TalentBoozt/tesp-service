import { OrgNodeEntity } from '../entities/org-node.entity';
export interface IOrgNodeRepository {
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
    moveNode?(projectId: string, nodeId: string, newParentId: string | null, oldPath: string, newPath: string): Promise<OrgNodeEntity>;
}
