"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSignoffModel = exports.ExecutiveWorkshopModel = exports.IndustryBenchmarkModel = exports.ClientEngagementModel = void 0;
const mongoose_1 = require("mongoose");
const ClientEngagementSchema = new mongoose_1.Schema({
    firmId: { type: String, required: false, index: true },
    projectId: { type: String, required: true, index: true },
    clientName: { type: String, required: true },
    clientCode: { type: String, required: true },
    sector: { type: String, required: true },
    leadConsultant: { type: String, required: true },
    stage: {
        type: String,
        enum: ['DIAGNOSTIC', 'FIELDWORK', 'AI_SYNTHESIS', 'EXECUTIVE_WORKSHOP', 'ACTION_SIGNOFF'],
        default: 'DIAGNOSTIC',
        required: true,
    },
    health: {
        type: String,
        enum: ['OPTIMAL', 'ATTENTION', 'CRITICAL'],
        default: 'OPTIMAL',
        required: true,
    },
    responseRate: { type: Number, default: 0 },
    totalEmployees: { type: Number, default: 0 },
    activeSurveys: { type: Number, default: 0 },
    lastDiagnosticDate: { type: String, required: true },
    nextMilestone: { type: String, required: true },
}, {
    timestamps: true,
    collection: 'consultant_engagements',
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
ClientEngagementSchema.index({ firmId: 1, projectId: 1 });
exports.ClientEngagementModel = (0, mongoose_1.model)('ClientEngagement', ClientEngagementSchema);
const IndustryBenchmarkSchema = new mongoose_1.Schema({
    firmId: { type: String, default: 'GLOBAL', index: true },
    metricKey: { type: String, required: true, index: true },
    metricName: { type: String, required: true },
    sector: { type: String, required: true, index: true },
    p25Score: { type: Number, required: true },
    p50MedianScore: { type: Number, required: true },
    p90TopDecileScore: { type: Number, required: true },
}, {
    timestamps: true,
    collection: 'consultant_benchmarks',
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
IndustryBenchmarkSchema.index({ firmId: 1, sector: 1, metricKey: 1 }, { unique: true });
exports.IndustryBenchmarkModel = (0, mongoose_1.model)('IndustryBenchmark', IndustryBenchmarkSchema);
const ExecutiveWorkshopSchema = new mongoose_1.Schema({
    firmId: { type: String, required: false, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    consultantLead: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    status: {
        type: String,
        enum: ['DRAFT', 'READY_FOR_EXEC', 'DELIVERED'],
        default: 'READY_FOR_EXEC',
        required: true,
    },
    keyThemes: [{ type: String }],
    recommendedInterventions: [{ type: String }],
    actionPlanIds: [{ type: String }],
}, {
    timestamps: true,
    collection: 'consultant_workshops',
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
ExecutiveWorkshopSchema.index({ firmId: 1, projectId: 1 });
exports.ExecutiveWorkshopModel = (0, mongoose_1.model)('ExecutiveWorkshop', ExecutiveWorkshopSchema);
const AiSignoffSchema = new mongoose_1.Schema({
    firmId: { type: String, required: false, index: true },
    projectId: { type: String, required: true, index: true },
    surveyTitle: { type: String, required: true },
    aiGeneratedInsight: { type: String, required: true },
    confidenceScore: { type: Number, required: true },
    riskSeverity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
        required: true,
    },
    consultantNotes: { type: String },
    signedOffBy: { type: String },
    signedOffAt: { type: String },
    isVerified: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
    collection: 'consultant_ai_signoffs',
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : ret.id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
AiSignoffSchema.index({ firmId: 1, projectId: 1 });
exports.AiSignoffModel = (0, mongoose_1.model)('AiSignoff', AiSignoffSchema);
//# sourceMappingURL=consultant.models.js.map