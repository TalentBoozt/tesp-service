"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employee_entity_1 = require("../../../domain/entities/employee.entity");
const employee_schema_1 = require("./employee.schema");
const field_encryption_service_1 = require("../../../../../shared/infrastructure/security/field-encryption.service");
class EmployeeMongoRepository {
    toEntity(doc) {
        return new employee_entity_1.EmployeeEntity({
            projectId: doc.projectId,
            employeeId: doc.employeeId,
            nodeId: doc.nodeId,
            matrixNodeIds: doc.matrixNodeIds,
            email: doc.email ? field_encryption_service_1.FieldEncryptionService.decrypt(doc.email) : undefined,
            fullName: field_encryption_service_1.FieldEncryptionService.decrypt(doc.fullName),
            phoneNumber: doc.phoneNumber ? field_encryption_service_1.FieldEncryptionService.decrypt(doc.phoneNumber) : undefined,
            status: doc.status,
            attributes: doc.attributes,
            version: doc.version,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async save(employee) {
        const raw = employee.toJSON();
        const encryptedEmail = raw.email ? field_encryption_service_1.FieldEncryptionService.encrypt(raw.email) : undefined;
        const emailBlindIndex = raw.email ? field_encryption_service_1.FieldEncryptionService.blindIndex(raw.email) : undefined;
        const encryptedFullName = field_encryption_service_1.FieldEncryptionService.encrypt(raw.fullName);
        const encryptedPhone = raw.phoneNumber ? field_encryption_service_1.FieldEncryptionService.encrypt(raw.phoneNumber) : undefined;
        const doc = await employee_schema_1.EmployeeModel.findOneAndUpdate({ projectId: employee.projectId, employeeId: employee.employeeId }, {
            $set: {
                nodeId: raw.nodeId,
                matrixNodeIds: raw.matrixNodeIds,
                email: encryptedEmail,
                emailBlindIndex,
                fullName: encryptedFullName,
                phoneNumber: encryptedPhone,
                status: raw.status,
                attributes: raw.attributes,
                version: raw.version,
                isDeleted: raw.isDeleted,
                updatedAt: raw.updatedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                employeeId: raw.employeeId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        if (!doc) {
            return employee;
        }
        return this.toEntity(doc);
    }
    async findByEmployeeId(projectId, employeeId) {
        const doc = await employee_schema_1.EmployeeModel.findOne({ projectId, employeeId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findByEmail(projectId, email) {
        const blindIndex = field_encryption_service_1.FieldEncryptionService.blindIndex(email);
        const doc = await employee_schema_1.EmployeeModel.findOne({
            projectId,
            $or: [
                { emailBlindIndex: blindIndex },
                { email },
            ],
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async find(projectIdOrQuery, options) {
        if (typeof projectIdOrQuery === 'string') {
            return this.findAll(projectIdOrQuery, options);
        }
        const { projectId, ...opts } = projectIdOrQuery;
        return this.findAll(projectId, opts);
    }
    async findAll(projectId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const baseQuery = { projectId, isDeleted: false };
        if (options?.nodeId) {
            baseQuery.$or = [{ nodeId: options.nodeId }, { matrixNodeIds: options.nodeId }];
        }
        if (options?.status) {
            baseQuery.status = options.status.toUpperCase();
        }
        if (options?.search) {
            const searchTrimmed = options.search.trim();
            // For exact email lookups, utilize HMAC-SHA256 blind index
            if (searchTrimmed.includes('@')) {
                const searchBlindIndex = field_encryption_service_1.FieldEncryptionService.createBlindIndex(searchTrimmed.toLowerCase());
                const emailQuery = {
                    ...baseQuery,
                    $or: [
                        { emailBlindIndex: searchBlindIndex },
                        { employeeId: searchTrimmed },
                    ],
                };
                const total = await employee_schema_1.EmployeeModel.countDocuments(emailQuery);
                if (total > 0) {
                    const docs = await employee_schema_1.EmployeeModel.find(emailQuery)
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .sort({ createdAt: -1 });
                    return {
                        employees: docs.map((doc) => this.toEntity(doc)),
                        total,
                    };
                }
            }
            // Name or partial text search across encrypted fields:
            // Retrieve tenant's employee documents scoped to projectId and filter decrypted entities in-memory
            const docs = await employee_schema_1.EmployeeModel.find(baseQuery).sort({ createdAt: -1 });
            const entities = docs.map((doc) => this.toEntity(doc));
            const searchLower = searchTrimmed.toLowerCase();
            const matched = entities.filter((emp) => {
                const nameMatch = emp.fullName?.toLowerCase().includes(searchLower);
                const emailMatch = emp.email?.toLowerCase().includes(searchLower);
                const idMatch = emp.employeeId?.toLowerCase().includes(searchLower);
                return Boolean(nameMatch || emailMatch || idMatch);
            });
            const total = matched.length;
            const skip = (page - 1) * limit;
            const employees = matched.slice(skip, skip + limit);
            return {
                employees,
                total,
            };
        }
        const total = await employee_schema_1.EmployeeModel.countDocuments(baseQuery);
        const docs = await employee_schema_1.EmployeeModel.find(baseQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        return {
            employees: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async existsByEmployeeId(projectId, employeeId) {
        const count = await employee_schema_1.EmployeeModel.countDocuments({ projectId, employeeId, isDeleted: false });
        return count > 0;
    }
    async bulkUpsert(employees) {
        if (employees.length === 0)
            return { inserted: 0, updated: 0 };
        const bulkOps = employees.map((emp) => {
            const raw = emp.toJSON();
            const encryptedEmail = raw.email ? field_encryption_service_1.FieldEncryptionService.encrypt(raw.email) : undefined;
            const emailBlindIndex = raw.email ? field_encryption_service_1.FieldEncryptionService.blindIndex(raw.email) : undefined;
            const encryptedFullName = field_encryption_service_1.FieldEncryptionService.encrypt(raw.fullName);
            const encryptedPhone = raw.phoneNumber ? field_encryption_service_1.FieldEncryptionService.encrypt(raw.phoneNumber) : undefined;
            return {
                updateOne: {
                    filter: { projectId: emp.projectId, employeeId: emp.employeeId },
                    update: {
                        $set: {
                            nodeId: raw.nodeId,
                            matrixNodeIds: raw.matrixNodeIds,
                            email: encryptedEmail,
                            emailBlindIndex,
                            fullName: encryptedFullName,
                            phoneNumber: encryptedPhone,
                            status: raw.status,
                            attributes: raw.attributes,
                            version: raw.version,
                            isDeleted: raw.isDeleted,
                            updatedAt: raw.updatedAt,
                        },
                        $setOnInsert: {
                            projectId: raw.projectId,
                            employeeId: raw.employeeId,
                            createdAt: raw.createdAt,
                        },
                    },
                    upsert: true,
                },
            };
        });
        const result = await employee_schema_1.EmployeeModel.bulkWrite(bulkOps, { ordered: false });
        const inserted = result.upsertedCount || 0;
        const updated = (result.modifiedCount || 0) + ((result.matchedCount || 0) - inserted);
        return { inserted, updated: Math.max(0, updated) };
    }
    async terminateMissingInList(projectId, activeEmployeeIdsInImport) {
        const result = await employee_schema_1.EmployeeModel.updateMany({
            projectId,
            employeeId: { $nin: activeEmployeeIdsInImport },
            status: { $ne: 'TERMINATED' },
            isDeleted: false,
        }, {
            $set: { status: 'TERMINATED', updatedAt: new Date() },
            $inc: { version: 1 },
        });
        return result.modifiedCount || 0;
    }
    async softDelete(projectId, employeeId) {
        const res = await employee_schema_1.EmployeeModel.updateOne({ projectId, employeeId, isDeleted: false }, { $set: { isDeleted: true, status: 'TERMINATED', updatedAt: new Date() }, $inc: { version: 1 } });
        return res.modifiedCount > 0;
    }
    async countActiveByNodeId(projectId, nodeId) {
        if (mongoose_1.default.connection?.readyState !== 1) {
            return 0;
        }
        return employee_schema_1.EmployeeModel.countDocuments({
            projectId,
            $or: [{ nodeId }, { matrixNodeIds: nodeId }],
            status: { $ne: 'TERMINATED' },
            isDeleted: false,
        });
    }
    async getNodeEmployeeIdSets(projectId) {
        if (mongoose_1.default.connection?.readyState !== 1) {
            return {};
        }
        const employees = await employee_schema_1.EmployeeModel.find({
            projectId,
            status: { $ne: 'TERMINATED' },
            isDeleted: false,
        }, { employeeId: 1, nodeId: 1, matrixNodeIds: 1 }).lean();
        const nodeEmpSets = {};
        for (const emp of employees) {
            const eId = emp.employeeId || emp._id.toString();
            if (emp.nodeId) {
                if (!nodeEmpSets[emp.nodeId]) {
                    nodeEmpSets[emp.nodeId] = new Set();
                }
                nodeEmpSets[emp.nodeId].add(eId);
            }
            if (Array.isArray(emp.matrixNodeIds)) {
                for (const mId of emp.matrixNodeIds) {
                    if (mId) {
                        if (!nodeEmpSets[mId]) {
                            nodeEmpSets[mId] = new Set();
                        }
                        nodeEmpSets[mId].add(eId);
                    }
                }
            }
        }
        return nodeEmpSets;
    }
}
exports.EmployeeMongoRepository = EmployeeMongoRepository;
//# sourceMappingURL=employee.repository.js.map