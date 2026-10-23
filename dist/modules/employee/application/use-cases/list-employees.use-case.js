"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEmployeesUseCase = void 0;
class ListEmployeesUseCase {
    employeeRepo;
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async execute(projectId, options) {
        return await this.employeeRepo.findAll(projectId, options);
    }
}
exports.ListEmployeesUseCase = ListEmployeesUseCase;
//# sourceMappingURL=list-employees.use-case.js.map