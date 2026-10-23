"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverrideSentimentDtoSchema = exports.AnalyzeTextResponsesDtoSchema = void 0;
const zod_1 = require("zod");
exports.AnalyzeTextResponsesDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z.string().min(1, 'campaignId is required'),
});
exports.OverrideSentimentDtoSchema = zod_1.z.object({
    newSentimentLabel: zod_1.z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=ai-analytics.dto.js.map