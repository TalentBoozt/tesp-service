"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const get_employee_survey_history_use_case_1 = require("../../application/use-cases/get-employee-survey-history.use-case");
const manage_hris_config_use_case_1 = require("../../application/use-cases/manage-hris-config.use-case");
const employee_dto_1 = require("../dto/employee.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
class EmployeeController {
    createEmployeeUseCase;
    updateEmployeeUseCase;
    bulkImportEmployeesUseCase;
    getEmployeeUseCase;
    getDemographicSnapshotUseCase;
    listEmployeesUseCase;
    terminateEmployeeUseCase;
    getEmployeeSurveyHistoryUseCase;
    manageHrisConfigUseCase;
    constructor(createEmployeeUseCase, updateEmployeeUseCase, bulkImportEmployeesUseCase, getEmployeeUseCase, getDemographicSnapshotUseCase, listEmployeesUseCase, terminateEmployeeUseCase, getEmployeeSurveyHistoryUseCase, manageHrisConfigUseCase) {
        this.createEmployeeUseCase = createEmployeeUseCase;
        this.updateEmployeeUseCase = updateEmployeeUseCase;
        this.bulkImportEmployeesUseCase = bulkImportEmployeesUseCase;
        this.getEmployeeUseCase = getEmployeeUseCase;
        this.getDemographicSnapshotUseCase = getDemographicSnapshotUseCase;
        this.listEmployeesUseCase = listEmployeesUseCase;
        this.terminateEmployeeUseCase = terminateEmployeeUseCase;
        this.getEmployeeSurveyHistoryUseCase = getEmployeeSurveyHistoryUseCase;
        this.manageHrisConfigUseCase = manageHrisConfigUseCase;
    }
    createEmployee = async (req, res, next) => {
        try {
            const incoming = req.body || {};
            const tenantProjectId = (0, tenant_context_1.resolveTenantProjectId)(req, incoming.projectId);
            const payload = {
                ...incoming,
                projectId: (incoming.projectId && incoming.projectId.trim().length > 0)
                    ? incoming.projectId.trim()
                    : tenantProjectId,
            };
            const parsed = employee_dto_1.CreateEmployeeSchema.safeParse(payload);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const employee = await this.createEmployeeUseCase.execute(parsed.data, actorContext);
            res.status(201).json({
                data: employee.toJSON(),
                accountProvisioned: true,
                message: 'Employee created and portal authentication credentials provisioned successfully.',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateEmployee = async (req, res, next) => {
        try {
            const { employeeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req, req.body?.projectId);
            const parsed = employee_dto_1.UpdateEmployeeSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const updated = await this.updateEmployeeUseCase.execute(projectId, employeeId, parsed.data, actorContext);
            res.status(200).json({ data: updated.toJSON(), accountProvisioned: true });
        }
        catch (err) {
            next(err);
        }
    };
    bulkImport = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req, req.body?.projectId);
            const parsed = employee_dto_1.BulkImportSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const summary = await this.bulkImportEmployeesUseCase.execute(projectId, parsed.data.records, { autoTerminateMissing: parsed.data.autoTerminateMissing }, actorContext);
            res.status(200).json({
                totalProcessed: summary.totalRecords,
                totalRecords: summary.totalRecords,
                employeesCreated: summary.inserted,
                inserted: summary.inserted,
                employeesUpdated: summary.updated,
                updated: summary.updated,
                terminated: summary.terminated,
                authAccountsProvisioned: summary.authAccountsProvisioned ?? summary.inserted,
                failed: summary.failed,
                errors: summary.errors,
            });
        }
        catch (err) {
            next(err);
        }
    };
    getEmployee = async (req, res, next) => {
        try {
            const { employeeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const employee = await this.getEmployeeUseCase.execute(projectId, employeeId);
            res.status(200).json({ data: employee.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    getDemographicSnapshot = async (req, res, next) => {
        try {
            const { employeeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const snapshot = await this.getDemographicSnapshotUseCase.execute(projectId, employeeId);
            res.status(200).json({ data: snapshot });
        }
        catch (err) {
            next(err);
        }
    };
    listEmployees = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const nodeId = req.query.nodeId;
            const status = req.query.status;
            const search = req.query.search;
            const result = await this.listEmployeesUseCase.execute(projectId, { page, limit, nodeId, status, search });
            res.status(200).json({
                data: result.employees.map((e) => e.toJSON()),
                meta: {
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (err) {
            next(err);
        }
    };
    terminateEmployee = async (req, res, next) => {
        try {
            const { employeeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            await this.terminateEmployeeUseCase.execute(projectId, employeeId, actorContext);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
    getSurveyHistory = async (req, res, next) => {
        try {
            const { employeeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            let targetEmpId = employeeId;
            if (targetEmpId === 'me' ||
                req.user?.role === auth_middleware_1.UserRole.SURVEY_RESPONDENT ||
                req.user?.role === 'EMPLOYEE') {
                targetEmpId = req.user?.employeeId || req.user?.userId || targetEmpId;
            }
            if (!this.getEmployeeSurveyHistoryUseCase) {
                this.getEmployeeSurveyHistoryUseCase = new get_employee_survey_history_use_case_1.GetEmployeeSurveyHistoryUseCase();
            }
            const history = await this.getEmployeeSurveyHistoryUseCase.execute(projectId, targetEmpId);
            res.status(200).json(history);
        }
        catch (err) {
            next(err);
        }
    };
    getMySurveys = async (req, res, next) => {
        try {
            const employeeId = req.user?.employeeId || req.user?.userId;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            if (!employeeId) {
                res.status(200).json([]);
                return;
            }
            if (!this.getEmployeeSurveyHistoryUseCase) {
                this.getEmployeeSurveyHistoryUseCase = new get_employee_survey_history_use_case_1.GetEmployeeSurveyHistoryUseCase();
            }
            const history = await this.getEmployeeSurveyHistoryUseCase.execute(projectId, employeeId);
            res.status(200).json(history);
        }
        catch (err) {
            next(err);
        }
    };
    getHrisConfig = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            if (!this.manageHrisConfigUseCase) {
                this.manageHrisConfigUseCase = new manage_hris_config_use_case_1.ManageHrisConfigUseCase();
            }
            const config = await this.manageHrisConfigUseCase.getConfig(projectId);
            res.status(200).json(config);
        }
        catch (err) {
            next(err);
        }
    };
    updateHrisConfig = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            if (!this.manageHrisConfigUseCase) {
                this.manageHrisConfigUseCase = new manage_hris_config_use_case_1.ManageHrisConfigUseCase();
            }
            const updated = await this.manageHrisConfigUseCase.updateConfig(projectId, req.body);
            res.status(200).json(updated);
        }
        catch (err) {
            next(err);
        }
    };
    syncHris = async (req, res, next) => {
        try {
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            if (!this.manageHrisConfigUseCase) {
                this.manageHrisConfigUseCase = new manage_hris_config_use_case_1.ManageHrisConfigUseCase();
            }
            const result = await this.manageHrisConfigUseCase.triggerSync(projectId, req.body);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=employee.controller.js.map