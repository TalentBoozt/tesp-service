import { OrgNodeEntity } from '../entities/org-node.entity';
export declare class CycleDetectionGuard {
    /**
     * Asserts that moving targetNode under newParentNode will NOT create a circular hierarchy loop.
     * VR-ORG-004: Target newParentId must NOT be equal to targetNode.nodeId OR present in targetNode's descendant tree.
     */
    static validateMove(targetNode: OrgNodeEntity, newParentNode: OrgNodeEntity | null): void;
}
