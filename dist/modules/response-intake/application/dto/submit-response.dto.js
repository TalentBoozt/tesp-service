"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitResponseDtoSchema = exports.SubmitAnswerDtoSchema = void 0;
const zod_1 = require("zod");
const campaign_entity_1 = require("../../../survey-distribution/domain/entities/campaign.entity");
exports.SubmitAnswerDtoSchema = zod_1.z.object({
    questionId: zod_1.z.string().min(1, 'questionId is required'),
    questionType: zod_1.z.enum([
        'LIKERT',
        'NPS',
        'RATING',
        'SINGLE_CHOICE',
        'MULTI_CHOICE',
        'SHORT_TEXT',
        'LONG_TEXT',
        'SLIDER',
        'RANKING',
        'MATRIX',
    ]),
    numericValue: zod_1.z.number().optional(),
    textValue: zod_1.z.string().optional(),
    selectedOptions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.SubmitResponseDtoSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'projectId is required'),
    campaignId: zod_1.z.string().min(1, 'campaignId is required'),
    surveyId: zod_1.z.string().min(1, 'surveyId is required'),
    surveyVersion: zod_1.z.number().int().positive('surveyVersion must be a positive integer'),
    responseToken: zod_1.z.string().optional(),
    respondentType: zod_1.z.nativeEnum(campaign_entity_1.AnonymityLevel),
    nodeId: zod_1.z.string().optional(),
    demographicSnapshot: zod_1.z.record(zod_1.z.any()).optional(),
    answers: zod_1.z.array(exports.SubmitAnswerDtoSchema).min(1, 'At least one answer is required'),
});
//# sourceMappingURL=submit-response.dto.js.map