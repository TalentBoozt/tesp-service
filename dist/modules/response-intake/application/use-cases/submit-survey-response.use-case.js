"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitSurveyResponseUseCase = exports.DuplicateSubmissionException = void 0;
const crypto_1 = require("crypto");
const answer_validator_service_1 = require("../../domain/services/answer-validator.service");
const pii_scrubber_service_1 = require("../../domain/services/pii-scrubber.service");
const anonymity_guard_service_1 = require("../../domain/services/anonymity-guard.service");
const survey_response_entity_1 = require("../../domain/entities/survey-response.entity");
const survey_response_submitted_event_1 = require("../../domain/events/survey-response-submitted.event");
const campaign_entity_1 = require("../../../survey-distribution/domain/entities/campaign.entity");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
const duplicate_submission_exception_1 = require("../../domain/errors/duplicate-submission.exception");
Object.defineProperty(exports, "DuplicateSubmissionException", { enumerable: true, get: function () { return duplicate_submission_exception_1.DuplicateSubmissionException; } });
class SubmitSurveyResponseUseCase {
    responseRepo;
    tokenBurnUseCase;
    surveyRepo;
    campaignRepo;
    eventBus;
    answerValidator;
    piiScrubber;
    anonymityGuard;
    constructor(responseRepo, tokenBurnUseCase, surveyRepo, campaignRepo, eventBus = event_bus_1.DomainEventBus.getInstance(), anonymityGuard) {
        this.responseRepo = responseRepo;
        this.tokenBurnUseCase = tokenBurnUseCase;
        this.surveyRepo = surveyRepo;
        this.campaignRepo = campaignRepo;
        this.eventBus = eventBus;
        this.answerValidator = new answer_validator_service_1.AnswerValidatorService();
        this.piiScrubber = new pii_scrubber_service_1.PiiScrubberService();
        this.anonymityGuard = anonymityGuard || new anonymity_guard_service_1.AnonymityGuardService();
    }
    async execute(dto) {
        // 0. Campaign Lifecycle Enforcement Guard (GAP-011 / TASK-011)
        let campaignAnonymityLevel;
        if (this.campaignRepo) {
            const campaign = await this.campaignRepo.findByCampaignId(dto.projectId, dto.campaignId);
            if (!campaign) {
                throw new Error(`Campaign '${dto.campaignId}' not found for project '${dto.projectId}'`);
            }
            if (campaign.status !== campaign_entity_1.CampaignStatus.ACTIVE) {
                throw new Error(`Cannot submit response: Campaign '${dto.campaignId}' is not active (current status: ${campaign.status})`);
            }
            const now = Date.now();
            if (campaign.startDate && now < new Date(campaign.startDate).getTime()) {
                throw new Error(`Cannot submit response: Campaign '${dto.campaignId}' has not started yet`);
            }
            if (campaign.expirationDate && now > new Date(campaign.expirationDate).getTime()) {
                throw new Error(`Cannot submit response: Campaign '${dto.campaignId}' has expired on ${new Date(campaign.expirationDate).toISOString()}`);
            }
            campaignAnonymityLevel = campaign.anonymityLevel;
        }
        const effectiveAnonymityLevel = campaignAnonymityLevel || dto.respondentType || campaign_entity_1.AnonymityLevel.SEMI_ANONYMOUS;
        // 1. Token Validation and Atomic Reservation (GAP-004: Atomic conditional state transition to eliminate TOCTOU race conditions)
        let tokenPayloadNodeId = dto.nodeId;
        let tokenBurned = false;
        let cachedPayload = undefined;
        if (dto.responseToken && this.tokenBurnUseCase) {
            const tokenResult = await this.tokenBurnUseCase.validateToken(dto.responseToken);
            if (!tokenResult.valid) {
                throw new Error(`Invalid or used survey token: ${tokenResult.error || 'Token is already burned or expired'}`);
            }
            cachedPayload = tokenResult.payload;
            if (tokenResult.payload?.nodeId) {
                tokenPayloadNodeId = tokenResult.payload.nodeId;
            }
            // Atomic reservation: burn token now to prevent concurrent race condition duplicate submissions
            const reservation = await this.tokenBurnUseCase.burnToken(dto.responseToken);
            if (!reservation.valid) {
                throw new duplicate_submission_exception_1.DuplicateSubmissionException(`Token has already been consumed or is invalid: ${reservation.error || 'Token is already burned'}`);
            }
            tokenBurned = true;
        }
        try {
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
                        sanitizedDemographicSnapshot[key.toLowerCase()] = value;
                    }
                }
            }
            // If demographic snapshot is missing keys, extract from AST and answers
            if (questionsAst && Array.isArray(dto.answers)) {
                for (const ans of dto.answers) {
                    const matchedQ = questionsAst.find((q) => q.questionId === ans.questionId);
                    if (!matchedQ)
                        continue;
                    const isDemoQ = matchedQ.groupId === 'DEMOGRAPHICS' ||
                        matchedQ.questionId.startsWith('Q-DEM');
                    if (!isDemoQ)
                        continue;
                    let promptText = '';
                    if (typeof matchedQ.prompt === 'string') {
                        promptText = matchedQ.prompt;
                    }
                    else if (matchedQ.prompt && typeof matchedQ.prompt === 'object') {
                        promptText = matchedQ.prompt['en-US'] || Object.values(matchedQ.prompt)[0] || '';
                    }
                    const lowerPrompt = promptText.toLowerCase();
                    let key = matchedQ.questionId.toLowerCase();
                    if (lowerPrompt.includes('department'))
                        key = 'department';
                    else if (lowerPrompt.includes('job title') || lowerPrompt.includes('title') || lowerPrompt.includes('role'))
                        key = 'jobTitle';
                    else if (lowerPrompt.includes('tenure') || lowerPrompt.includes('length of service') || lowerPrompt.includes('service'))
                        key = 'tenure';
                    else if (lowerPrompt.includes('arrangement') || lowerPrompt.includes('work arrangement'))
                        key = 'workArrangement';
                    else if (lowerPrompt.includes('employment type') || lowerPrompt.includes('contract'))
                        key = 'employmentType';
                    else if (lowerPrompt.includes('gender'))
                        key = 'gender';
                    else if (lowerPrompt.includes('location') || lowerPrompt.includes('office'))
                        key = 'location';
                    else if (lowerPrompt.includes('age'))
                        key = 'ageGroup';
                    const rawVal = ans.textValue || (ans.selectedOptions && ans.selectedOptions[0]) || ans.numericValue;
                    if (rawVal == null)
                        continue;
                    let displayVal = rawVal;
                    if (Array.isArray(matchedQ.options) && matchedQ.options.length > 0) {
                        const opt = matchedQ.options.find((o) => o.optionId === rawVal || o.id === rawVal);
                        if (opt) {
                            if (typeof opt.label === 'string')
                                displayVal = opt.label;
                            else if (opt.label && typeof opt.label === 'object')
                                displayVal = opt.label['en-US'] || Object.values(opt.label)[0] || rawVal;
                        }
                    }
                    if (!sanitizedDemographicSnapshot[key]) {
                        sanitizedDemographicSnapshot[key] = displayVal;
                        sanitizedDemographicSnapshot[key.toLowerCase()] = displayVal;
                    }
                }
            }
            // 5. Generate Cryptographically Secure Response ID (GAP-025)
            const responseId = `RSP-${(0, crypto_1.randomUUID)()}`;
            const rawProps = {
                projectId: dto.projectId,
                campaignId: dto.campaignId,
                surveyId: dto.surveyId,
                surveyVersion: dto.surveyVersion,
                responseId,
                respondentType: effectiveAnonymityLevel,
                responseToken: dto.responseToken,
                nodeId: tokenPayloadNodeId,
                demographicSnapshot: sanitizedDemographicSnapshot,
                answers: sanitizedAnswers,
                submittedAt: new Date(),
            };
            // GAP-001 / TASK-01-01: Decouple responseToken and sanitize demographic data for anonymous surveys
            const sanitizedSubmission = this.anonymityGuard.sanitizeForIngestion(rawProps, effectiveAnonymityLevel, {
                responseToken: dto.responseToken,
                consentGiven: true,
            });
            const responseEntity = new survey_response_entity_1.SurveyResponseEntity(sanitizedSubmission.sanitizedProps);
            // Save response to primary database
            await this.responseRepo.save(responseEntity);
            // 6. Emit In-Process Domain Event (FR-INT-005)
            const event = new survey_response_submitted_event_1.SurveyResponseSubmittedEvent({
                projectId: dto.projectId,
                campaignId: dto.campaignId,
                surveyId: dto.surveyId,
                surveyVersion: dto.surveyVersion,
                responseId,
                respondentType: effectiveAnonymityLevel,
                nodeId: tokenPayloadNodeId,
                answerCount: sanitizedAnswers.length,
            });
            await this.eventBus.publish(event);
            return {
                responseId,
                status: 'ACCEPTED',
                message: 'Survey response submitted successfully',
            };
        }
        catch (err) {
            // If token was reserved but subsequent validation or database persistence fails,
            // revert token reservation so user can correct answers and resubmit (GAP-004)
            if (tokenBurned && dto.responseToken && this.tokenBurnUseCase && cachedPayload) {
                await this.tokenBurnUseCase.restoreToken(dto.responseToken, cachedPayload);
            }
            throw err;
        }
    }
}
exports.SubmitSurveyResponseUseCase = SubmitSurveyResponseUseCase;
//# sourceMappingURL=submit-survey-response.use-case.js.map