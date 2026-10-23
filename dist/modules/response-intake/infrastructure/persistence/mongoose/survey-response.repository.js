"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseMongoRepository = void 0;
const survey_response_entity_1 = require("../../../domain/entities/survey-response.entity");
const survey_response_schema_1 = require("./survey-response.schema");
class SurveyResponseMongoRepository {
    toEntity(doc) {
        return new survey_response_entity_1.SurveyResponseEntity({
            projectId: doc.projectId,
            campaignId: doc.campaignId,
            surveyId: doc.surveyId,
            surveyVersion: doc.surveyVersion,
            responseId: doc.responseId,
            respondentType: doc.respondentType,
            responseToken: doc.responseToken,
            nodeId: doc.nodeId,
            demographicSnapshot: doc.demographicSnapshot,
            answers: doc.answers,
            submittedAt: doc.submittedAt,
            isDeleted: doc.isDeleted,
        });
    }
    async save(response) {
        const raw = response.toJSON();
        const doc = await survey_response_schema_1.SurveyResponseModel.create({
            projectId: raw.projectId,
            campaignId: raw.campaignId,
            surveyId: raw.surveyId,
            surveyVersion: raw.surveyVersion,
            responseId: raw.responseId,
            respondentType: raw.respondentType,
            responseToken: raw.responseToken,
            nodeId: raw.nodeId,
            demographicSnapshot: raw.demographicSnapshot,
            answers: raw.answers,
            submittedAt: raw.submittedAt,
            isDeleted: raw.isDeleted,
        });
        return this.toEntity(doc);
    }
    async findByResponseId(projectId, responseId) {
        const doc = await survey_response_schema_1.SurveyResponseModel.findOne({ projectId, responseId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAllByCampaign(projectId, campaignId, options) {
        const query = { projectId, campaignId, isDeleted: false };
        const limit = options?.limit || 50;
        const offset = options?.offset || 0;
        const [docs, total] = await Promise.all([
            survey_response_schema_1.SurveyResponseModel.find(query).sort({ submittedAt: -1 }).skip(offset).limit(limit),
            survey_response_schema_1.SurveyResponseModel.countDocuments(query),
        ]);
        return {
            responses: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
}
exports.SurveyResponseMongoRepository = SurveyResponseMongoRepository;
//# sourceMappingURL=survey-response.repository.js.map