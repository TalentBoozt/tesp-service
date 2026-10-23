"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEmployeeUseCase = void 0;
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
class GetEmployeeUseCase {
    employeeRepo;
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async execute(projectId, employeeId) {
        const employee = await this.employeeRepo.findByEmployeeId(projectId, employeeId);
        if (!employee || employee.isDeleted) {
            throw new error_middleware_1.AppError(404, `Employee with ID '${employeeId}' was not found.`, 'https://tesp-api.talnova.io/errors/employee-not-found');
        }
        return employee;
    }
}
exports.GetEmployeeUseCase = GetEmployeeUseCase;
//# sourceMappingURL=get-employee.use-case.js.map