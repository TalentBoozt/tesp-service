"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitSurveyResponseUseCase = void 0;
const answer_validator_service_1 = require("../../domain/services/answer-validator.service");
const pii_scrubber_service_1 = require("../../domain/services/pii-scrubber.service");
const survey_response_entity_1 = require("../../domain/entities/survey-response.entity");
const survey_response_submitted_event_1 = require("../../domain/events/survey-response-submitted.event");
class SubmitSurveyResponseUseCase {
    responseRepo;
    tokenBurnUseCase;
    surveyRepo;
    answerValidator;
    piiScrubber;
    constructor(responseRepo, tokenBurnUseCase, surveyRepo) {
        this.responseRepo = responseRepo;
        this.tokenBurnUseCase = tokenBurnUseCase;
        this.surveyRepo = surveyRepo;
        this.answerValidator = new answer_validator_service_1.AnswerValidatorService();
        this.piiScrubber = new pii_scrubber_service_1.PiiScrubberService();
    }
    async execute(dto) {
        // 1. Atomic Token Validation & Single-Use Burn Guard (BR-INT-001, VR-INT-001)
        let tokenPayloadNodeId = dto.nodeId;
        if (dto.responseToken && this.tokenBurnUseCase) {
            const burnResult = await this.tokenBurnUseCase.burnToken(dto.responseToken);
            if (!burnResult.valid) {
                throw new Error(`Invalid or used survey token: ${burnResult.error || 'Token is already burned or expired'}`);
            }
            if (burnResult.payload?.nodeId) {
                tokenPayloadNodeId = burnResult.payload.nodeId;
            }
        }
        // 2. Validate Answers against AST Question Rules & Score Bounds (FR-INT-003, VR-INT-002, VR-INT-003)
        let questionsAst = undefined;
        if (this.surveyRepo) {
            const survey = await this.surveyRepo.findBySurveyId(dto.projectId, dto.surveyId, dto.surveyVersion);
            if (survey && survey.pages) {
                questionsAst = [];
                for (const page of survey.pages) {
                    if (page.sections) {
                        for (const section of page.sections) {
                            if (section.questions) {
                                questionsAst.push(...section.questions);
                            }
                        }
                    }
                }
            }
        }
        this.answerValidator.validateAnswers(dto.answers, questionsAst);
        // 3. Redact Open-Text PII (Emails & Phone Numbers)
        const sanitizedAnswers = this.piiScrubber.sanitizeAnswers(dto.answers);
        // 4. Sanitize Demographic Metadata Snapshot (BR-INT-002, FR-INT-004)
        const sanitizedDemographicSnapshot = {};
        if (dto.demographicSnapshot) {
            for (const [key, value] of Object.entries(dto.demographicSnapshot)) {
                // Exclude identity keys
                if (!['employeeid', 'email', 'fullname', 'name'].includes(key.toLowerCase())) {
                    sanitizedDemographicSnapshot[key] = value;
                }
            }
        }
        // 5. Generate Unique Response ID
        const responseId = `RSP-${Math.floor(10000000 + Math.random() * 90000000)}`;
        // 6. Create & Persist Write-Once Response Entity
        const responseEntity = new survey_response_entity_1.SurveyResponseEntity({
            projectId: dto.projectId,
            campaignId: dto.campaignId,
            surveyId: dto.surveyId,
            surveyVersion: dto.surveyVersion,
            responseId,
            respondentType: dto.respondentType,
            responseToken: dto.responseToken,
            nodeId: tokenPayloadNodeId,
            demographicSnapshot: sanitizedDemographicSnapshot,
            answers: sanitizedAnswers,
            submittedAt: new Date(),
        });
        await this.responseRepo.save(responseEntity);
        // 7. Emit In-Process Domain Event (FR-INT-005)
        new survey_response_submitted_event_1.SurveyResponseSubmittedEvent({
            projectId: dto.projectId,
            campaignId: dto.campaignId,
            surveyId: dto.surveyId,
            surveyVersion: dto.surveyVersion,
            responseId,
            respondentType: dto.respondentType,
            nodeId: tokenPayloadNodeId,
            answerCount: sanitizedAnswers.length,
        });
        return {
            responseId,
            status: 'ACCEPTED',
            message: 'Survey response submitted successfully',
        };
    }
}
exports.SubmitSurveyResponseUseCase = SubmitSurveyResponseUseCase;
//# sourceMappingURL=submit-survey-response.use-case.js.map