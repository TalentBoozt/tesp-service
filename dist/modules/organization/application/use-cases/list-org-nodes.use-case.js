"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrgNodesUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employee_repository_1 = require("../../../employee/infrastructure/persistence/mongoose/employee.repository");
const org_headcount_service_1 = require("../../domain/services/org-headcount.service");
class ListOrgNodesUseCase {
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
                // Fallback when DB connection unavailable
            }
        }
    }
    async execute(projectId, options) {
        const isFiltered = options?.parentId !== undefined || options?.type;
        const allProjectNodes = isFiltered
            ? await this.repository.findAllByProject(projectId)
            : await this.repository.findAllByProject(projectId, options);
        if (this.employeeRepo?.getNodeEmployeeIdSets) {
            try {
                const nodeEmpSets = await this.employeeRepo.getNodeEmployeeIdSets(projectId);
                org_headcount_service_1.OrgHeadcountService.enrichNodesWithHeadcounts(allProjectNodes, nodeEmpSets);
            }
            catch (err) {
                console.warn('Failed to calculate live headcounts for org nodes:', err);
            }
        }
        if (isFiltered) {
            return allProjectNodes.filter((n) => {
                if (options?.parentId !== undefined && n.parentId !== options.parentId)
                    return false;
                if (options?.type && n.type !== options.type.toUpperCase())
                    return false;
                return true;
            });
        }
        return allProjectNodes;
    }
}
exports.ListOrgNodesUseCase = ListOrgNodesUseCase;
//# sourceMappingURL=list-org-nodes.use-case.js.map