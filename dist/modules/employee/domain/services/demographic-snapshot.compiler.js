"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemographicSnapshotCompiler = void 0;
class DemographicSnapshotCompiler {
    /**
     * Compiles an immutable demographic snapshot payload for survey response intake.
     * Strips out all PII fields (email, fullName, phoneNumber) and includes org node ancestor paths.
     */
    static compile(employee, ancestorPaths) {
        return {
            employeeId: employee.employeeId,
            projectId: employee.projectId,
            nodeId: employee.nodeId,
            matrixNodeIds: employee.matrixNodeIds,
            attributes: employee.attributes,
            ...(ancestorPaths ? { ancestorPaths } : {}),
            compiledAt: new Date().toISOString(),
        };
    }
}
exports.DemographicSnapshotCompiler = DemographicSnapshotCompiler;
//# sourceMappingURL=demographic-snapshot.compiler.js.map