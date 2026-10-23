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
exports.QuestionLibraryModel = exports.SurveyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SurveySchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    surveyId: {
        type: String,
        required: true,
        match: /^SRV-[A-Za-z0-9_-]{3,20}$/,
    },
    version: { type: Number, default: 1, required: true },
    title: { type: mongoose_1.Schema.Types.Mixed, required: true },
    description: { type: mongoose_1.Schema.Types.Mixed },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'ARCHIVED'],
        default: 'DRAFT',
    },
    pages: { type: mongoose_1.Schema.Types.Mixed, required: true, default: [] },
    publishedAt: { type: Date, default: null },
    versionHistory: { type: mongoose_1.Schema.Types.Mixed, default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    collection: 'surveys',
    timestamps: true,
});
// Compound Unique Index: Unique (projectId, surveyId, version) combination
SurveySchema.index({ projectId: 1, surveyId: 1, version: 1 }, { unique: true });
// Query Index: Active/published survey queries
SurveySchema.index({ projectId: 1, status: 1, isDeleted: 1 });
exports.SurveyModel = mongoose_1.default.model('Survey', SurveySchema);
const QuestionLibrarySchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    libraryItemId: { type: String, required: true },
    category: { type: String, required: true, uppercase: true, index: true },
    groupId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    prompt: { type: mongoose_1.Schema.Types.Mixed, required: true },
    options: { type: mongoose_1.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
}, {
    collection: 'question_library',
    timestamps: true,
});
QuestionLibrarySchema.index({ projectId: 1, libraryItemId: 1 }, { unique: true });
exports.QuestionLibraryModel = mongoose_1.default.model('QuestionLibrary', QuestionLibrarySchema);
//# sourceMappingURL=survey.schema.js.map