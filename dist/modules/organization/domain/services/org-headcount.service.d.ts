import { OrgNodeEntity } from '../entities/org-node.entity';
export declare class OrgHeadcountService {
    /**
     * Enriches organization nodes with accurate direct and cumulative roll-up headcounts.
     * Root nodes will receive the union count of direct employees plus all descendant nodes in their subtree.
     */
    static enrichNodesWithHeadcounts(nodes: OrgNodeEntity[], nodeEmpSets: Record<string, Set<string>>): void;
}
