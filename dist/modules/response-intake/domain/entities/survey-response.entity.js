"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyResponseEntity = void 0;
const answer_value_object_1 = require("./answer.value-object");
class SurveyResponseEntity {
    projectId;
    campaignId;
    surveyId;
    surveyVersion;
    responseId;
    respondentType;
    responseToken;
    nodeId;
    demographicSnapshot;
    answers;
    submittedAt;
    isDeleted;
    constructor(props) {
        this.validateResponseId(props.responseId);
        if (!props.projectId || !props.campaignId || !props.surveyId) {
            throw new Error('projectId, campaignId, and surveyId are required');
        }
        if (!props.answers || props.answers.length === 0) {
            throw new Error('Response must contain at least one answer');
        }
        this.projectId = props.projectId;
        this.campaignId = props.campaignId;
        this.surveyId = props.surveyId;
        this.surveyVersion = props.surveyVersion;
        this.responseId = props.responseId;
        this.respondentType = props.respondentType;
        this.responseToken = props.responseToken;
        this.nodeId = props.nodeId;
        this.demographicSnapshot = props.demographicSnapshot ? { ...props.demographicSnapshot } : {};
        this.answers = props.answers.map((a) => (a instanceof answer_value_object_1.AnswerValueObject ? a : new answer_value_object_1.AnswerValueObject(a)));
        this.submittedAt = props.submittedAt || new Date();
        this.isDeleted = props.isDeleted ?? false;
    }
    validateResponseId(responseId) {
        const pattern = /^RSP-[A-Za-z0-9_-]{3,50}$/;
        if (!pattern.test(responseId)) {
            throw new Error(`Invalid Response ID format: '${responseId}'. Must match pattern ^RSP-[A-Za-z0-9_-]{3,50}$`);
        }
    }
    toJSON() {
        return {
            projectId: this.projectId,
            campaignId: this.campaignId,
            surveyId: this.surveyId,
            surveyVersion: this.surveyVersion,
            responseId: this.responseId,
            respondentType: this.respondentType,
            responseToken: this.responseToken,
            nodeId: this.nodeId,
            demographicSnapshot: { ...this.demographicSnapshot },
            answers: this.answers.map((a) => a.toJSON()),
            submittedAt: this.submittedAt,
            isDeleted: this.isDeleted,
        };
    }
}
exports.SurveyResponseEntity = SurveyResponseEntity;
//# sourceMappingURL=survey-response.entity.js.map