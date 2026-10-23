"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatmapQueryDtoSchema = exports.DashboardQueryDtoSchema = void 0;
const zod_1 = require("zod");
exports.DashboardQueryDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z.string().min(1, 'campaignId is required'),
    nodeId: zod_1.z.string().optional(),
    demographicFilters: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.HeatmapQueryDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z.string().min(1, 'campaignId is required'),
    parentNodeId: zod_1.z.string().optional(),
});
//# sourceMappingURL=analytics.dto.js.map