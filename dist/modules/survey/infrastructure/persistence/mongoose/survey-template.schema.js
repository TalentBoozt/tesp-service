"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyTemplateModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SurveyTemplateSchema = new mongoose_1.Schema({
    templateId: { type: String, required: true, unique: true, index: true },
    name: { type: mongoose_1.Schema.Types.Mixed, required: true },
    category: { type: String, required: true, index: true },
    description: { type: mongoose_1.Schema.Types.Mixed, required: true },
    targetAudience: { type: String },
    estimatedTimeMinutes: { type: Number, default: 10 },
    questionCount: { type: Number, default: 0 },
    sectionsCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    isPublic: { type: Boolean, default: true, index: true },
    projectId: { type: String, default: 'GLOBAL', index: true },
    pages: { type: mongoose_1.Schema.Types.Mixed, required: true, default: [] },
}, {
    collection: 'survey_templates',
    timestamps: true,
});
SurveyTemplateSchema.index({ category: 1, isPublic: 1 });
exports.SurveyTemplateModel = mongoose_1.default.model('SurveyTemplate', SurveyTemplateSchema);
//# sourceMappingURL=survey-template.schema.js.map