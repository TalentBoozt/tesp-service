"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgHeadcountService = void 0;
class OrgHeadcountService {
    /**
     * Enriches organization nodes with accurate direct and cumulative roll-up headcounts.
     * Root nodes will receive the union count of direct employees plus all descendant nodes in their subtree.
     */
    static enrichNodesWithHeadcounts(nodes, nodeEmpSets) {
        if (!nodes || nodes.length === 0)
            return;
        // Map of parentId -> child nodes
        const childrenMap = new Map();
        for (const node of nodes) {
            if (node.parentId) {
                if (!childrenMap.has(node.parentId)) {
                    childrenMap.set(node.parentId, []);
                }
                childrenMap.get(node.parentId).push(node);
            }
        }
        // Memoized cache of employee IDs for each node's entire subtree
        const subtreeSets = new Map();
        function getSubtreeEmployeeIds(nodeId, visited = new Set()) {
            if (visited.has(nodeId))
                return new Set(); // Prevent infinite recursion on circular graphs
            if (subtreeSets.has(nodeId))
                return subtreeSets.get(nodeId);
            visited.add(nodeId);
            const combined = new Set(nodeEmpSets[nodeId] || []);
            const children = childrenMap.get(nodeId) || [];
            for (const child of children) {
                const childSet = getSubtreeEmployeeIds(child.nodeId, new Set(visited));
                for (const id of childSet) {
                    combined.add(id);
                }
            }
            subtreeSets.set(nodeId, combined);
            return combined;
        }
        for (const node of nodes) {
            const directSet = nodeEmpSets[node.nodeId] || new Set();
            const subtreeSet = getSubtreeEmployeeIds(node.nodeId);
            node.setHeadCount(subtreeSet.size, directSet.size);
        }
    }
}
exports.OrgHeadcountService = OrgHeadcountService;
//# sourceMappingURL=org-headcount.service.js.map