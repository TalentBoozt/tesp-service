export declare class PathCalculatorService {
    /**
     * Computes the materialized path string and depth level for an organization node.
     * If parentPath is null/undefined (root node), returns `,nodeId,` and depth 1.
     * If parentPath is provided (e.g. `,N-001,N-101,`), returns `,N-001,N-101,N-201,` and depth 3.
     */
    static computePathAndDepth(nodeId: string, parentPath?: string | null): {
        path: string;
        depth: number;
    };
    /**
     * Replaces prefix of child path when a parent node moves.
     * Example:
     * oldPrefix: `,N-001,N-101,N-201,`
     * newPrefix: `,N-001,N-102,N-201,`
     * childPath: `,N-001,N-101,N-201,N-301,`
     * -> returns: `,N-001,N-102,N-201,N-301,`
     */
    static replacePathPrefix(childPath: string, oldPrefix: string, newPrefix: string): string;
}
