"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployeeRouter = createEmployeeRouter;
const express_1 = require("express");
const employee_repository_1 = require("../../infrastructure/persistence/mongoose/employee.repository");
const org_node_repository_1 = require("../../../organization/infrastructure/persistence/mongoose/org-node.repository");
const create_employee_use_case_1 = require("../../application/use-cases/create-employee.use-case");
const update_employee_use_case_1 = require("../../application/use-cases/update-employee.use-case");
const bulk_import_employees_use_case_1 = require("../../application/use-cases/bulk-import-employees.use-case");
const get_employee_use_case_1 = require("../../application/use-cases/get-employee.use-case");
const get_demographic_snapshot_use_case_1 = require("../../application/use-cases/get-demographic-snapshot.use-case");
const list_employees_use_case_1 = require("../../application/use-cases/list-employees.use-case");
const terminate_employee_use_case_1 = require("../../application/use-cases/terminate-employee.use-case");
const get_employee_survey_history_use_case_1 = require("../../application/use-cases/get-employee-survey-history.use-case");
const manage_hris_config_use_case_1 = require("../../application/use-cases/manage-hris-config.use-case");
const employee_controller_1 = require("./employee.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createEmployeeRouter(employeeRepo, orgNodeRepo, surveyHistoryUseCase, hrisConfigUseCase) {
    const router = (0, express_1.Router)();
    const repo = employeeRepo || new employee_repository_1.EmployeeMongoRepository();
    const orgRepo = orgNodeRepo || new org_node_repository_1.OrgNodeMongoRepository();
    const createEmployeeUseCase = new create_employee_use_case_1.CreateEmployeeUseCase(repo, orgRepo);
    const updateEmployeeUseCase = new update_employee_use_case_1.UpdateEmployeeUseCase(repo, orgRepo);
    const bulkImportEmployeesUseCase = new bulk_import_employees_use_case_1.BulkImportEmployeesUseCase(repo);
    const getEmployeeUseCase = new get_employee_use_case_1.GetEmployeeUseCase(repo);
    const getDemographicSnapshotUseCase = new get_demographic_snapshot_use_case_1.GetDemographicSnapshotUseCase(repo, orgRepo);
    const listEmployeesUseCase = new list_employees_use_case_1.ListEmployeesUseCase(repo);
    const terminateEmployeeUseCase = new terminate_employee_use_case_1.TerminateEmployeeUseCase(repo);
    const getEmployeeSurveyHistory = surveyHistoryUseCase || new get_employee_survey_history_use_case_1.GetEmployeeSurveyHistoryUseCase();
    const manageHris = hrisConfigUseCase || new manage_hris_config_use_case_1.ManageHrisConfigUseCase(repo);
    const controller = new employee_controller_1.EmployeeController(createEmployeeUseCase, updateEmployeeUseCase, bulkImportEmployeesUseCase, getEmployeeUseCase, getDemographicSnapshotUseCase, listEmployeesUseCase, terminateEmployeeUseCase, getEmployeeSurveyHistory, manageHris);
    router.use(['/employees', '/internal/employees'], auth_middleware_1.authenticate);
    // HRIS Integration Endpoints (Must precede /employees/:employeeId)
    router.get('/employees/hris-config', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.getHrisConfig);
    router.put('/employees/hris-config', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.updateHrisConfig);
    router.post('/employees/hris-sync', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.syncHris);
    // Employee Portal "My Surveys" Endpoint (Accessible by Employee role or authenticated users)
    router.get('/employees/me/surveys', controller.getMySurveys);
    // Survey Participation History Endpoint
    router.get('/employees/:employeeId/survey-history', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER, auth_middleware_1.UserRole.SURVEY_RESPONDENT]), controller.getSurveyHistory);
    router.post('/employees', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.createEmployee);
    router.post(['/employees/bulk-import', '/employees/import'], (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.bulkImport);
    router.get('/employees', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER]), controller.listEmployees);
    router.get('/employees/:employeeId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER]), controller.getEmployee);
    router.get('/internal/employees/:employeeId/demographic-snapshot', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.DEPARTMENT_MANAGER]), controller.getDemographicSnapshot);
    router.put('/employees/:employeeId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.updateEmployee);
    router.delete('/employees/:employeeId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.CONSULTANT, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.terminateEmployee);
    return router;
}
//# sourceMappingURL=employee.routes.js.map