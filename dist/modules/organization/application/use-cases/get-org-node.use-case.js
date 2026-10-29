"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrgNodeUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employee_repository_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.repository");
const org_headcount_service_1 = require("../../domain/services/org-headcount.service");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetOrgNodeUseCase {
    repository;
    employeeRepo;
    constructor(repository, employeeRepo) {
        this.repository = repository;
        if (employeeRepo) {
            this.employeeRepo = employeeRepo;
        }
        else if (mongoose_1.default.connection?.readyState === 1) {
            try {
                this.employeeRepo = new employee_repository_1.EmployeeMongoRepository();
            }
            catch {
                // Fallback
            }
        }
    }
    async execute(projectId, nodeId) {
        const node = await this.repository.findByNodeId(projectId, nodeId);
        if (!node || node.isDeleted) {
            throw new error_middleware_1.AppError(404, `Organization node '${nodeId}' was not found.`, 'https://tesp-api.talnova.io/errors/node-not-found');
        }
        if (this.employeeRepo?.getNodeEmployeeIdSets) {
            try {
                const allNodes = await this.repository.findAllByProject(projectId);
                const nodeEmpSets = await this.employeeRepo.getNodeEmployeeIdSets(projectId);
                org_headcount_service_1.OrgHeadcountService.enrichNodesWithHeadcounts(allNodes, nodeEmpSets);
                const enriched = allNodes.find((n) => n.nodeId === nodeId);
                if (enriched)
                    return enriched;
            }
            catch (err) {
                console.warn('Failed to calculate live headcounts for org node:', err);
            }
        }
        return node;
    }
}
exports.GetOrgNodeUseCase = GetOrgNodeUseCase;
//# sourceMappingURL=get-org-node.use-case.js.map