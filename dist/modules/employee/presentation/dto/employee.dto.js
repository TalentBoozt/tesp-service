"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportSchema = exports.UpdateEmployeeSchema = exports.CreateEmployeeSchema = void 0;
const zod_1 = require("zod");
exports.CreateEmployeeSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    employeeId: zod_1.z.string().regex(/^[A-Za-z0-9_-]{2,30}$/, 'Invalid Employee ID format. Expected format: ^[A-Za-z0-9_-]{2,30}$ (e.g. EMP-101)').optional().or(zod_1.z.literal('')),
    nodeId: zod_1.z.string().min(1, 'Primary nodeId is required'),
    matrixNodeIds: zod_1.z.array(zod_1.z.string()).optional(),
    email: zod_1.z.string().email('Invalid email address format').optional().or(zod_1.z.literal('')),
    fullName: zod_1.z.string().min(1, 'fullName is required'),
    phoneNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']).optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
}).refine((data) => !!(data.email?.trim() || data.employeeId?.trim() || data.phoneNumber?.trim()), { message: 'At least one identifier (email, employeeId, or phoneNumber) is mandatory.' });
exports.UpdateEmployeeSchema = zod_1.z.object({
    nodeId: zod_1.z.string().min(1, 'Primary nodeId cannot be empty').optional(),
    matrixNodeIds: zod_1.z.array(zod_1.z.string()).optional(),
    email: zod_1.z.string().email('Invalid email address format').optional().or(zod_1.z.literal('')),
    fullName: zod_1.z.string().min(1, 'fullName cannot be empty').optional(),
    phoneNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']).optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.BulkImportSchema = zod_1.z.object({
    autoTerminateMissing: zod_1.z.boolean().optional(),
    records: zod_1.z.array(zod_1.z.object({
        employeeId: zod_1.z.string().regex(/^[A-Za-z0-9_-]{2,30}$/, 'Invalid Employee ID format').optional().or(zod_1.z.literal('')),
        nodeId: zod_1.z.string().min(1, 'Primary nodeId is required'),
        matrixNodeIds: zod_1.z.array(zod_1.z.string()).optional(),
        email: zod_1.z.string().email('Invalid email address format').optional().or(zod_1.z.literal('')),
        fullName: zod_1.z.string().min(1, 'fullName is required'),
        phoneNumber: zod_1.z.string().optional().or(zod_1.z.literal('')),
        status: zod_1.z.enum(['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']).optional(),
        attributes: zod_1.z.record(zod_1.z.any()).optional(),
    }).refine((data) => !!(data.email?.trim() || data.employeeId?.trim() || data.phoneNumber?.trim()), { message: 'At least one identifier (email, employeeId, or phoneNumber) is mandatory.' })).min(1, 'Array of employee records is required'),
});
//# sourceMappingURL=employee.dto.js.map