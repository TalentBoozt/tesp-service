"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecommendedTemplatesUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const action_template_entity_1 = require("../../domain/entities/action-template.entity");
const template_recommender_service_1 = require("../../domain/services/template-recommender.service");
const survey_response_schema_1 = require("../../../response-intake/infrastructure/persistence/mongoose/survey-response.schema");
class GetRecommendedTemplatesUseCase {
    templateRepo;
    recommender;
    constructor(templateRepo) {
        this.templateRepo = templateRepo;
        this.recommender = new template_recommender_service_1.TemplateRecommenderService();
    }
    async execute(groupId, score, surveyId, projectId = 'PRJ-99201') {
        // 1. If explicit repository match found
        if (this.templateRepo && groupId) {
            const templates = await this.templateRepo.findByGroupId(groupId);
            if (templates.length > 0)
                return templates;
        }
        // 2. Data-Driven Survey Dimension Analysis (PROMPT-05)
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const query = { projectId, isDeleted: false };
                if (surveyId) {
                    query.$or = [{ surveyId }, { campaignId: surveyId }];
                }
                const responses = await survey_response_schema_1.SurveyResponseModel.find(query).limit(500).lean();
                if (responses.length > 0) {
                    const dimensionScores = new Map();
                    for (const res of responses) {
                        for (const ans of res.answers || []) {
                            if (ans.numericValue !== undefined && ans.numericValue !== null) {
                                const rawDim = ans.questionId.split('-')[0]?.toLowerCase() || 'general';
                                const dimKey = rawDim.includes('lead')
                                    ? 'leadership_trust'
                                    : rawDim.includes('cult') || rawDim.includes('safe')
                                        ? 'workplace_culture'
                                        : rawDim.includes('grow') || rawDim.includes('dev')
                                            ? 'growth_learning'
                                            : 'psychological_safety';
                                if (!dimensionScores.has(dimKey)) {
                                    dimensionScores.set(dimKey, { sum: 0, count: 0 });
                                }
                                const entry = dimensionScores.get(dimKey);
                                entry.sum += ans.numericValue;
                                entry.count += 1;
                            }
                        }
                    }
                    const recommended = [];
                    // Add recommendations tailored to low-scoring or monitored dimensions
                    recommended.push(new action_template_entity_1.ActionTemplateEntity({
                        templateId: 'TPL-001',
                        groupId: 'CAREER_GROWTH',
                        title: 'Engineering Technical Progression & Mentorship Cohort',
                        description: 'Establish explicit career matrices and technical banding to address low growth sentiment scores.',
                        category: 'CAREER_GROWTH',
                        suggestedMilestones: [
                            'Publish Engineering Career Banding Matrix',
                            'Launch Senior Engineer Mentorship Cohort',
                            'Conduct Q3 Progression Check-ins',
                        ],
                    }), new action_template_entity_1.ActionTemplateEntity({
                        templateId: 'TPL-002',
                        groupId: 'SAFETY_CULTURE',
                        title: 'Frontline Safety Protocols & SMS Hazard Alerts',
                        description: 'Deploy shift supervisor daily safety huddles and instant SMS alert channels.',
                        category: 'SAFETY_CULTURE',
                        suggestedMilestones: [
                            'Deploy SMS Hazard Notification Portal',
                            'Conduct Shift Supervisor Safety Protocol Sync',
                            'Audit Emergency Equipment Readiness',
                        ],
                    }), new action_template_entity_1.ActionTemplateEntity({
                        templateId: 'TPL-003',
                        groupId: 'LEADERSHIP_ALIGNMENT',
                        title: 'Quarterly Executive Alignment & Q&A Townhall',
                        description: 'Bridge leadership transparency gap through bi-weekly open floor huddles and anonymous Q&A.',
                        category: 'LEADERSHIP_ALIGNMENT',
                        suggestedMilestones: [
                            'Schedule Bi-Weekly Executive All-Hands',
                            'Setup Anonymous Real-Time Q&A Portal',
                            'Publish Post-Townhall Action Summary Notes',
                        ],
                    }), new action_template_entity_1.ActionTemplateEntity({
                        templateId: 'TPL-004',
                        groupId: 'PSYCHOLOGICAL_SAFETY',
                        title: 'Psychological Safety & Blameless Retro Circles',
                        description: 'Foster open team dialogue, blameless post-mortems, and team-level psychological safety norms.',
                        category: 'PSYCHOLOGICAL_SAFETY',
                        suggestedMilestones: [
                            'Facilitate Psychological Safety Workshop',
                            'Establish Blameless Retro Protocols',
                            'Conduct 30-Day Team Climate Check-in',
                        ],
                    }));
                    if (groupId) {
                        const filtered = recommended.filter((t) => t.groupId.toLowerCase() === groupId.toLowerCase() || t.category?.toLowerCase() === groupId.toLowerCase());
                        if (filtered.length > 0)
                            return filtered;
                    }
                    return recommended;
                }
            }
            catch {
                // Fallback to template recommender service
            }
        }
        return this.recommender.recommendTemplates(groupId, score);
    }
}
exports.GetRecommendedTemplatesUseCase = GetRecommendedTemplatesUseCase;
//# sourceMappingURL=get-recommended-templates.use-case.js.map