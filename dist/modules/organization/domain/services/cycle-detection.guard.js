"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CycleDetectionGuard = void 0;
class CycleDetectionGuard {
    /**
     * Asserts that moving targetNode under newParentNode will NOT create a circular hierarchy loop.
     * VR-ORG-004: Target newParentId must NOT be equal to targetNode.nodeId OR present in targetNode's descendant tree.
     */
    static validateMove(targetNode, newParentNode) {
        if (!newParentNode) {
            // Moving to root position is always valid
            return;
        }
        if (newParentNode.nodeId === targetNode.nodeId) {
            throw new Error(`Circular hierarchy move detected. Node '${targetNode.nodeId}' cannot be its own parent.`);
        }
        // Check if newParent's path contains targetNode's nodeId as a segment
        const targetSegment = `,${targetNode.nodeId},`;
        if (newParentNode.path.includes(targetSegment)) {
            throw new Error(`Circular hierarchy move detected. Target new parent '${newParentNode.nodeId}' is a descendant of node '${targetNode.nodeId}' (Path: ${newParentNode.path}).`);
        }
    }
}
exports.CycleDetectionGuard = CycleDetectionGuard;
//# sourceMappingURL=cycle-detection.guard.js.map