"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActionPlanDtoSchema = exports.TransitionStatusDtoSchema = exports.CreateActionPlanDtoSchema = exports.MilestoneDtoSchema = void 0;
const zod_1 = require("zod");
exports.MilestoneDtoSchema = zod_1.z.object({
    milestoneId: zod_1.z.string().min(1, 'milestoneId is required'),
    title: zod_1.z.string().min(1, 'title is required'),
    dueDate: zod_1.z.string().transform((val) => new Date(val)),
});
exports.CreateActionPlanDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z.string().min(1, 'campaignId is required'),
    nodeId: zod_1.z.string().min(1, 'nodeId is required'),
    groupId: zod_1.z.string().min(1, 'groupId is required'),
    title: zod_1.z.string().min(1, 'title is required'),
    description: zod_1.z.string().optional(),
    assigneeId: zod_1.z.string().min(1, 'assigneeId is required'),
    baselineScore: zod_1.z.number(),
    targetScore: zod_1.z.number(),
    targetCompletionDate: zod_1.z.string().transform((val) => new Date(val)),
    milestones: zod_1.z.array(exports.MilestoneDtoSchema).optional(),
});
exports.TransitionStatusDtoSchema = zod_1.z.object({
    targetStatus: zod_1.z.enum([
        'DRAFT',
        'PROPOSED',
        'APPROVED',
        'REJECTED',
        'IN_PROGRESS',
        'COMPLETED',
        'VERIFIED',
        'CANCELLED',
    ]),
    reason: zod_1.z.string().optional(),
    postActionScore: zod_1.z.number().optional(),
});
exports.UpdateActionPlanDtoSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    assigneeId: zod_1.z.string().optional(),
    targetScore: zod_1.z.number().optional(),
    targetCompletionDate: zod_1.z
        .string()
        .transform((val) => new Date(val))
        .optional(),
    milestones: zod_1.z.array(exports.MilestoneDtoSchema).optional(),
});
//# sourceMappingURL=action-plan.dto.js.map