"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreezeAnalyticalSnapshotUseCase = void 0;
const analytical_snapshot_entity_1 = require("../../domain/entities/analytical-snapshot.entity");
const analytical_snapshot_created_event_1 = require("../../domain/events/analytical-snapshot-created.event");
const enps_calculator_service_1 = require("../../domain/services/enps-calculator.service");
const engagement_index_calculator_1 = require("../../domain/services/engagement-index.calculator");
const privacy_guard_service_1 = require("../../domain/services/privacy-guard.service");
const event_bus_1 = require("../../../../shared/domain/events/event-bus");
class FreezeAnalyticalSnapshotUseCase {
    snapshotRepo;
    responseRepo;
    enpsCalculator;
    engagementCalculator;
    privacyGuard;
    surveyRepo;
    eventBus;
    constructor(snapshotRepo, responseRepo, surveyRepoOrEventBus, eventBusOrSurveyRepo) {
        this.snapshotRepo = snapshotRepo;
        this.responseRepo = responseRepo;
        if (surveyRepoOrEventBus &&
            'publish' in surveyRepoOrEventBus &&
            typeof surveyRepoOrEventBus.publish === 'function') {
            this.eventBus = surveyRepoOrEventBus;
            this.surveyRepo = eventBusOrSurveyRepo;
        }
        else {
            this.surveyRepo = surveyRepoOrEventBus;
            this.eventBus = eventBusOrSurveyRepo || event_bus_1.DomainEventBus.getInstance();
        }
        this.enpsCalculator = new enps_calculator_service_1.EnpsCalculatorService();
        this.engagementCalculator = new engagement_index_calculator_1.EngagementIndexCalculatorService();
        this.privacyGuard = new privacy_guard_service_1.PrivacyGuardService();
    }
    async execute(projectId, campaignId, surveyId) {
        const { responses } = await this.responseRepo.findAllByCampaign(projectId, campaignId, { limit: 100000 });
        // Build question group mapping from survey definition (GAP-011 / TASK-04-02)
        const questionGroupMap = new Map();
        if (this.surveyRepo) {
            try {
                const survey = await this.surveyRepo.findBySurveyId(projectId, surveyId);
                if (survey && survey.pages) {
                    for (const page of survey.pages) {
                        if (page.sections) {
                            for (const section of page.sections) {
                                if (section.questions) {
                                    for (const q of section.questions) {
                                        const qId = q.questionId || q.id;
                                        const assignedGroup = q.groupId || section.sectionId;
                                        if (qId && assignedGroup) {
                                            questionGroupMap.set(qId, assignedGroup);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                console.warn(`[FreezeAnalyticalSnapshotUseCase] Unable to resolve question groups for survey ${surveyId}:`, err);
            }
        }
        const npsScores = [];
        const likertScores = [];
        const groupAnswers = [];
        const nodeResponseMap = new Map();
        for (const res of responses) {
            const nodeId = res.nodeId || 'GLOBAL';
            if (!nodeResponseMap.has(nodeId)) {
                nodeResponseMap.set(nodeId, []);
            }
            for (const ans of res.answers) {
                if (ans.numericValue !== undefined) {
                    nodeResponseMap.get(nodeId).push(ans.numericValue);
                    if (ans.questionType === 'NPS')
                        npsScores.push(ans.numericValue);
                    if (ans.questionType === 'LIKERT') {
                        likertScores.push(ans.numericValue);
                        const groupId = questionGroupMap.get(ans.questionId) || 'GRP-GENERAL';
                        groupAnswers.push({ groupId, numericValue: ans.numericValue });
                    }
                }
            }
        }
        const overallEnps = this.enpsCalculator.calculateEnps(npsScores).eNPS ?? 0;
        const overallEngagementIndex = this.engagementCalculator.calculateIndex(likertScores);
        const groupScores = this.engagementCalculator.calculateGroupScores(groupAnswers);
        const nodeAggregates = [];
        for (const [nodeId, scores] of nodeResponseMap.entries()) {
            const count = scores.length;
            const index = this.engagementCalculator.calculateIndex(scores);
            const protectedResult = this.privacyGuard.applyPrivacyGuard(count, index, index);
            nodeAggregates.push({
                nodeId,
                responseCount: count,
                status: protectedResult.status,
                enps: protectedResult.eNPS,
                engagementIndex: protectedResult.engagementIndex,
            });
        }
        const snapshotId = `SNP-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const snapshot = new analytical_snapshot_entity_1.AnalyticalSnapshotEntity({
            projectId,
            campaignId,
            surveyId,
            snapshotId,
            snapshotDate: new Date(),
            totalResponses: responses.length,
            overallEnps,
            overallEngagementIndex,
            groupScores,
            nodeAggregates,
        });
        const saved = await this.snapshotRepo.save(snapshot);
        // Emit event (FR-ANL-007)
        const event = new analytical_snapshot_created_event_1.AnalyticalSnapshotCreatedEvent({
            projectId,
            campaignId,
            surveyId,
            snapshotId,
            totalResponses: responses.length,
            overallEnps,
            overallEngagementIndex,
        });
        await this.eventBus.publish(event);
        return saved;
    }
}
exports.FreezeAnalyticalSnapshotUseCase = FreezeAnalyticalSnapshotUseCase;
//# sourceMappingURL=freeze-analytical-snapshot.use-case.js.map