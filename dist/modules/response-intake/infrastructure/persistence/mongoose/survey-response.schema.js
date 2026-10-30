"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseModel = void 0;
const mongoose_1 = require("mongoose");
const campaign_entity_1 = require("../../../../survey-distribution/domain/entities/campaign.entity");
const SurveyResponseSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    surveyId: { type: String, required: true },
    surveyVersion: { type: Number, required: true },
    responseId: { type: String, required: true, unique: true, index: true },
    respondentType: {
        type: String,
        enum: Object.values(campaign_entity_1.AnonymityLevel),
        required: true,
    },
    responseToken: { type: String, index: true },
    nodeId: { type: String },
    matrixNodeIds: [{ type: String }],
    demographicSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    answers: [
        {
            questionId: { type: String, required: true },
            questionType: { type: String, required: true },
            numericValue: { type: Number },
            textValue: { type: String },
            selectedOptions: [{ type: String }],
        },
    ],
    submittedAt: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: false,
    collection: 'survey_responses',
});
SurveyResponseSchema.index({ projectId: 1, campaignId: 1 });
exports.SurveyResponseModel = (0, mongoose_1.model)('SurveyResponse', SurveyResponseSchema);
//# sourceMappingURL=survey-response.schema.js.map