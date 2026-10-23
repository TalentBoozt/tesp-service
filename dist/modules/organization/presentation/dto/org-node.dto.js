"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrgNodeSchema = exports.MoveOrgNodeSchema = exports.CreateOrgNodeSchema = void 0;
const zod_1 = require("zod");
exports.CreateOrgNodeSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    nodeId: zod_1.z.string().regex(/^N-[A-Za-z0-9_-]{3,20}$/, 'Invalid Node ID format. Expected format: ^N-[A-Za-z0-9_-]{3,20}$ (e.g. N-201)'),
    name: zod_1.z.string().min(1, 'Node name is required'),
    type: zod_1.z.string().min(1, 'Node type is required'),
    parentId: zod_1.z.string().nullable().optional(),
    displayOrder: zod_1.z.number().int().optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.MoveOrgNodeSchema = zod_1.z.object({
    newParentId: zod_1.z.string().nullable(),
});
exports.UpdateOrgNodeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Node name cannot be empty').optional(),
    type: zod_1.z.string().min(1, 'Node type cannot be empty').optional(),
    displayOrder: zod_1.z.number().int().optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=org-node.dto.js.map