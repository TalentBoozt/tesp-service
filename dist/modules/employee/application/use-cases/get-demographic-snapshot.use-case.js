"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDemographicSnapshotUseCase = void 0;
const demographic_snapshot_compiler_1 = require("../../domain/services/demographic-snapshot.compiler");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetDemographicSnapshotUseCase {
    employeeRepo;
    orgNodeRepo;
    constructor(employeeRepo, orgNodeRepo) {
        this.employeeRepo = employeeRepo;
        this.orgNodeRepo = orgNodeRepo;
    }
    async execute(projectId, employeeId) {
        const employee = await this.employeeRepo.findByEmployeeId(projectId, employeeId);
        if (!employee || employee.isDeleted) {
            throw new error_middleware_1.AppError(404, `Employee with ID '${employeeId}' was not found.`, 'https://tesp-api.talnova.io/errors/employee-not-found');
        }
        let ancestorPaths;
        if (this.orgNodeRepo) {
            const orgNode = await this.orgNodeRepo.findByNodeId(projectId, employee.nodeId);
            if (orgNode) {
                ancestorPaths = orgNode.path;
            }
        }
        return demographic_snapshot_compiler_1.DemographicSnapshotCompiler.compile(employee, ancestorPaths);
    }
}
exports.GetDemographicSnapshotUseCase = GetDemographicSnapshotUseCase;
//# sourceMappingURL=get-demographic-snapshot.use-case.js.map