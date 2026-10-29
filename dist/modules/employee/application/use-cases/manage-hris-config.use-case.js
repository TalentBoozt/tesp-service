"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageHrisConfigUseCase = void 0;
const hris_config_model_1 = require("../../infrastructure/persistence/mongoose/hris-config.model");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const hris_connector_factory_1 = require("../../infrastructure/adapters/hris/hris-connector.factory");
const employee_repository_1 = require("../../infrastructure/persistence/mongoose/employee.repository");
const employee_entity_1 = require("../../domain/entities/employee.entity");
class ManageHrisConfigUseCase {
    employeeRepository;
    constructor(employeeRepository = new employee_repository_1.EmployeeMongoRepository()) {
        this.employeeRepository = employeeRepository;
    }
    async getConfig(projectId) {
        const doc = await hris_config_model_1.HrisConfigModel.findOne({ projectId });
        if (!doc) {
            return null;
        }
        const json = doc.toJSON();
        return {
            provider: json.provider,
            tenantUrl: json.tenantUrl,
            clientId: json.clientId,
            syncSchedule: json.syncSchedule,
            lastSyncAt: json.lastSyncAt ? new Date(json.lastSyncAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC' : undefined,
            syncedCount: json.syncedCount,
            status: json.status,
        };
    }
    async updateConfig(projectId, dto) {
        if (!dto.provider) {
            throw new error_middleware_1.AppError(400, 'HRIS provider is required');
        }
        if (!dto.tenantUrl) {
            throw new error_middleware_1.AppError(400, 'Tenant URL is required');
        }
        const updateData = {
            provider: dto.provider,
            tenantUrl: dto.tenantUrl,
            syncSchedule: dto.syncSchedule || 'NIGHTLY',
            status: 'CONNECTED',
        };
        if (dto.clientId !== undefined)
            updateData.clientId = dto.clientId;
        if (dto.clientSecret !== undefined && dto.clientSecret !== '••••••••••••••••') {
            updateData.clientSecret = dto.clientSecret;
        }
        const doc = await hris_config_model_1.HrisConfigModel.findOneAndUpdate({ projectId }, { $set: updateData }, { upsert: true, new: true, runValidators: true });
        const json = doc.toJSON();
        return {
            provider: json.provider,
            tenantUrl: json.tenantUrl,
            clientId: json.clientId,
            syncSchedule: json.syncSchedule,
            lastSyncAt: json.lastSyncAt ? new Date(json.lastSyncAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC' : undefined,
            syncedCount: json.syncedCount,
            status: json.status,
        };
    }
    async triggerSync(projectId, dto) {
        // 1. If incoming config is provided, update it first
        if (dto && dto.provider && dto.tenantUrl) {
            await this.updateConfig(projectId, dto);
        }
        const configDoc = await hris_config_model_1.HrisConfigModel.findOne({ projectId });
        if (!configDoc) {
            throw new error_middleware_1.AppError(404, `No HRIS configuration active for project '${projectId}'`);
        }
        const now = new Date();
        let created = 0;
        let updated = 0;
        let failed = 0;
        const errors = [];
        try {
            // 2. Resolve genuine provider connector
            const connector = hris_connector_factory_1.HrisConnectorFactory.createConnector({
                provider: configDoc.provider,
                tenantUrl: configDoc.tenantUrl,
                clientId: configDoc.clientId,
                clientSecret: configDoc.clientSecret,
            });
            // 3. Fetch normalized records from remote HRIS
            const remoteEmployees = await connector.fetchEmployees();
            // 4. Upsert fetched records into Employee collection
            for (const emp of remoteEmployees) {
                try {
                    if (!emp.employeeId && !emp.workEmail) {
                        failed++;
                        continue;
                    }
                    let existing = null;
                    if (emp.employeeId) {
                        existing = await this.employeeRepository.findByEmployeeId(projectId, emp.employeeId);
                    }
                    if (!existing && emp.workEmail && this.employeeRepository.findByEmail) {
                        existing = await this.employeeRepository.findByEmail(projectId, emp.workEmail);
                    }
                    const fullName = emp.fullName?.trim() ||
                        [emp.firstName, emp.lastName].filter(Boolean).join(' ').trim() ||
                        emp.workEmail ||
                        'Unknown Employee';
                    const email = emp.workEmail?.trim()?.toLowerCase() || undefined;
                    if (existing) {
                        existing.updateDetails({
                            fullName,
                            email,
                            phoneNumber: emp.phoneNumber?.trim() || existing.phoneNumber,
                            nodeId: emp.nodeId?.trim() || existing.nodeId,
                            status: emp.status || existing.status || 'ACTIVE',
                            attributes: { ...(existing.attributes || {}), ...(emp.attributes || {}) },
                        });
                        await this.employeeRepository.save(existing);
                        updated++;
                    }
                    else {
                        let sanitizedEmployeeId = emp.employeeId?.trim();
                        if (sanitizedEmployeeId && !employee_entity_1.EmployeeEntity.EMPLOYEE_ID_REGEX.test(sanitizedEmployeeId)) {
                            sanitizedEmployeeId = `EMP-${sanitizedEmployeeId.replace(/[^A-Za-z0-9_-]/g, '_')}`.substring(0, 30);
                        }
                        const newEmployee = new employee_entity_1.EmployeeEntity({
                            projectId,
                            employeeId: sanitizedEmployeeId,
                            fullName,
                            email,
                            phoneNumber: emp.phoneNumber?.trim(),
                            nodeId: emp.nodeId?.trim() || 'NODE-GLOBAL',
                            status: emp.status || 'ACTIVE',
                            attributes: emp.attributes || {},
                            isDeleted: false,
                        });
                        await this.employeeRepository.save(newEmployee);
                        created++;
                    }
                }
                catch (err) {
                    failed++;
                    errors.push(`Failed to upsert employee ${emp.employeeId || emp.workEmail}: ${err.message}`);
                }
            }
            const totalSynced = created + updated;
            const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
            await hris_config_model_1.HrisConfigModel.updateOne({ projectId }, {
                $set: {
                    lastSyncAt: now,
                    syncedCount: totalSynced,
                    status: 'CONNECTED',
                },
            });
            return {
                success: true,
                syncedCount: totalSynced,
                created,
                updated,
                failed,
                lastSyncAt: formattedDate,
                provider: configDoc.provider,
                status: 'CONNECTED',
            };
        }
        catch (syncError) {
            await hris_config_model_1.HrisConfigModel.updateOne({ projectId }, {
                $set: {
                    status: 'ERROR',
                    lastSyncAt: now,
                },
            });
            throw new error_middleware_1.AppError(502, `HRIS sync failed for ${configDoc.provider}: ${syncError.message}`);
        }
    }
}
exports.ManageHrisConfigUseCase = ManageHrisConfigUseCase;
//# sourceMappingURL=manage-hris-config.use-case.js.map