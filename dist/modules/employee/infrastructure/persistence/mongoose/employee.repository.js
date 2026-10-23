"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMongoRepository = void 0;
const employee_entity_1 = require("../../../domain/entities/employee.entity");
const employee_schema_1 = require("./employee.schema");
class EmployeeMongoRepository {
    toEntity(doc) {
        return new employee_entity_1.EmployeeEntity({
            projectId: doc.projectId,
            employeeId: doc.employeeId,
            nodeId: doc.nodeId,
            matrixNodeIds: doc.matrixNodeIds,
            email: doc.email,
            fullName: doc.fullName,
            phoneNumber: doc.phoneNumber,
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
        const doc = await employee_schema_1.EmployeeModel.findOneAndUpdate({ projectId: employee.projectId, employeeId: employee.employeeId }, {
            $set: {
                nodeId: raw.nodeId,
                matrixNodeIds: raw.matrixNodeIds,
                email: raw.email,
                fullName: raw.fullName,
                phoneNumber: raw.phoneNumber,
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
        return this.toEntity(doc);
    }
    async findByEmployeeId(projectId, employeeId) {
        const doc = await employee_schema_1.EmployeeModel.findOne({ projectId, employeeId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAll(projectId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const query = { projectId, isDeleted: false };
        if (options?.nodeId) {
            query.$or = [{ nodeId: options.nodeId }, { matrixNodeIds: options.nodeId }];
        }
        if (options?.status) {
            query.status = options.status.toUpperCase();
        }
        if (options?.search) {
            const searchRegex = new RegExp(options.search, 'i');
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { employeeId: searchRegex },
            ];
        }
        const total = await employee_schema_1.EmployeeModel.countDocuments(query);
        const docs = await employee_schema_1.EmployeeModel.find(query)
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
            return {
                updateOne: {
                    filter: { projectId: emp.projectId, employeeId: emp.employeeId },
                    update: {
                        $set: {
                            nodeId: raw.nodeId,
                            matrixNodeIds: raw.matrixNodeIds,
                            email: raw.email,
                            fullName: raw.fullName,
                            phoneNumber: raw.phoneNumber,
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
}
exports.EmployeeMongoRepository = EmployeeMongoRepository;
//# sourceMappingURL=employee.repository.js.map