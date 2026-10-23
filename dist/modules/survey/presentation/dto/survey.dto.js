"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionLibrarySchema = exports.SaveSurveyDraftSchema = exports.PageSchema = exports.SectionSchema = exports.QuestionSchema = exports.QuestionOptionSchema = exports.BranchingLogicRuleSchema = void 0;
const zod_1 = require("zod");
exports.BranchingLogicRuleSchema = zod_1.z.object({
    ruleId: zod_1.z.string().min(1, 'ruleId is required'),
    operator: zod_1.z.enum(['EQUALS', 'NOT_EQUALS', 'LESS_THAN', 'GREATER_THAN', 'IN']),
    value: zod_1.z.any(),
    targetPageId: zod_1.z.string().min(1, 'targetPageId is required'),
});
exports.QuestionOptionSchema = zod_1.z.object({
    optionId: zod_1.z.string().min(1, 'optionId is required'),
    label: zod_1.z.record(zod_1.z.string()).refine((val) => Object.keys(val).length > 0, 'Option label must contain at least 1 locale string'),
    scoreValue: zod_1.z.number().optional(),
});
exports.QuestionSchema = zod_1.z.object({
    questionId: zod_1.z.string().min(1, 'questionId is required'),
    type: zod_1.z.enum([
        'LIKERT',
        'NPS',
        'MATRIX',
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'RANKING',
        'SHORT_TEXT',
        'LONG_TEXT',
        'NUMERIC',
        'DATE',
    ]),
    groupId: zod_1.z.string().optional(),
    prompt: zod_1.z.record(zod_1.z.string()).refine((val) => Object.keys(val).length > 0, 'Question prompt must contain at least 1 locale string'),
    isMandatory: zod_1.z.boolean().optional(),
    options: zod_1.z.array(exports.QuestionOptionSchema).optional(),
    logicRules: zod_1.z.array(exports.BranchingLogicRuleSchema).optional(),
}).refine((data) => {
    if (['LIKERT', 'NPS', 'MATRIX'].includes(data.type)) {
        return !!data.groupId && data.groupId.trim().length > 0;
    }
    return true;
}, { message: 'Mandatory Question Group (groupId) missing for scale question type', path: ['groupId'] });
exports.SectionSchema = zod_1.z.object({
    sectionId: zod_1.z.string().min(1, 'sectionId is required'),
    title: zod_1.z.record(zod_1.z.string()).optional(),
    sectionOrder: zod_1.z.number().int().optional(),
    questions: zod_1.z.array(exports.QuestionSchema).default([]),
});
exports.PageSchema = zod_1.z.object({
    pageId: zod_1.z.string().min(1, 'pageId is required'),
    title: zod_1.z.record(zod_1.z.string()).optional(),
    pageOrder: zod_1.z.number().int({ message: 'pageOrder must be an integer' }),
    sections: zod_1.z.array(exports.SectionSchema).default([]),
});
exports.SaveSurveyDraftSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    surveyId: zod_1.z.string().regex(/^SRV-[A-Za-z0-9_-]{3,20}$/, 'Invalid Survey ID format. Expected format: ^SRV-[A-Za-z0-9_-]{3,20}$ (e.g. SRV-5001)'),
    version: zod_1.z.number().int().optional(),
    title: zod_1.z.record(zod_1.z.string()).refine((val) => Object.keys(val).length > 0, 'Survey title is required and must contain at least 1 locale string'),
    description: zod_1.z.record(zod_1.z.string()).optional(),
    pages: zod_1.z.array(exports.PageSchema).default([]),
});
exports.QuestionLibrarySchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    libraryItemId: zod_1.z.string().regex(/^LIB-[A-Za-z0-9_-]{3,20}$/, 'Invalid Library Item ID format. Expected format: ^LIB-[A-Za-z0-9_-]{3,20}$ (e.g. LIB-101)'),
    category: zod_1.z.string().min(1, 'category is required'),
    groupId: zod_1.z.string().min(1, 'groupId is required'),
    type: zod_1.z.enum([
        'LIKERT',
        'NPS',
        'MATRIX',
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'RANKING',
        'SHORT_TEXT',
        'LONG_TEXT',
        'NUMERIC',
        'DATE',
    ]),
    prompt: zod_1.z.record(zod_1.z.string()).refine((val) => Object.keys(val).length > 0, 'Prompt dictionary is required'),
    options: zod_1.z.array(exports.QuestionOptionSchema).optional(),
});
//# sourceMappingURL=survey.dto.js.map