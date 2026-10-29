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
const tenant_context_required_error_1 = require("../../../../shared/domain/errors/tenant-context-required.error");
class GetRecommendedTemplatesUseCase {
    templateRepo;
    responseRepo;
    recommender;
    constructor(templateRepo, responseRepo) {
        this.templateRepo = templateRepo;
        this.responseRepo = responseRepo;
        this.recommender = new template_recommender_service_1.TemplateRecommenderService();
    }
    async execute(groupId, score, surveyId, projectId) {
        if (!projectId) {
            throw new tenant_context_required_error_1.TenantContextRequiredError('Tenant projectId is required to recommend action templates');
        }
        // 1. If explicit groupId requested and repository has exact matches
        if (this.templateRepo && groupId) {
            const templates = await this.templateRepo.findByGroupId(groupId);
            if (templates.length > 0)
                return templates;
        }
        // 2. Data-Driven Survey Dimension Analysis (GAP-013 / TASK-04-01)
        if (surveyId) {
            let responses = [];
            if (this.responseRepo) {
                try {
                    const res = await this.responseRepo.findAllByCampaign(projectId, surveyId, { limit: 1000 });
                    responses = res.responses || [];
                }
                catch {
                    // Fallback to Mongoose
                }
            }
            if (responses.length === 0 && mongoose_1.default.connection.readyState === 1) {
                try {
                    const query = {
                        projectId,
                        isDeleted: false,
                        $or: [{ surveyId }, { campaignId: surveyId }],
                    };
                    responses = await survey_response_schema_1.SurveyResponseModel.find(query).limit(1000).lean();
                }
                catch {
                    // Fallback
                }
            }
            if (responses.length > 0) {
                const dimensionStats = new Map();
                for (const res of responses) {
                    for (const ans of res.answers || []) {
                        if (ans.numericValue !== undefined && ans.numericValue !== null) {
                            const val = Number(ans.numericValue);
                            const rawDim = (ans.groupId ||
                                ans.category ||
                                (ans.questionId && ans.questionId.includes('-') ? ans.questionId.split('-')[0] : 'general'))
                                .toLowerCase()
                                .replace(/-/g, '_');
                            if (!dimensionStats.has(rawDim)) {
                                dimensionStats.set(rawDim, { sum: 0, count: 0, favorableCount: 0 });
                            }
                            const entry = dimensionStats.get(rawDim);
                            entry.sum += val;
                            entry.count += 1;
                            // Favorable threshold: >= 4 on 5-scale or >= 7 on 10-scale
                            const isFavorable = val > 5 ? val >= 7 : val >= 4;
                            if (isFavorable) {
                                entry.favorableCount += 1;
                            }
                        }
                    }
                }
                if (dimensionStats.size > 0) {
                    // Calculate score percentage (0-100) for each dimension
                    const evaluatedDimensions = [];
                    for (const [dimKey, stats] of dimensionStats.entries()) {
                        if (stats.count > 0) {
                            const favorablePct = (stats.favorableCount / stats.count) * 100;
                            evaluatedDimensions.push({ dimKey, scorePercent: favorablePct });
                        }
                    }
                    // Sort ascending (lowest scores first)
                    evaluatedDimensions.sort((a, b) => a.scorePercent - b.scorePercent);
                    // Find weak categories (favorable score < 65% or bottom 2)
                    let targetCategories = evaluatedDimensions.filter((d) => d.scorePercent < 65).map((d) => d.dimKey);
                    if (targetCategories.length === 0 && evaluatedDimensions.length > 0) {
                        const allHigh = evaluatedDimensions.every((d) => d.scorePercent >= 85);
                        if (!allHigh) {
                            targetCategories = evaluatedDimensions.slice(0, 2).map((d) => d.dimKey);
                        }
                    }
                    const recommended = [];
                    // Query repository for templates matching weak categories
                    if (this.templateRepo) {
                        const allTemplates = await this.templateRepo.findAll();
                        for (const cat of targetCategories) {
                            const matched = allTemplates.filter((t) => t.groupId.toLowerCase() === cat ||
                                t.category?.toLowerCase() === cat ||
                                t.title.toLowerCase().includes(cat.replace(/_/g, ' ')) ||
                                cat.includes(t.groupId.toLowerCase()));
                            recommended.push(...matched);
                        }
                    }
                    // Generate dynamic targeted intervention templates if repository has none for this category
                    if (recommended.length === 0 && targetCategories.length > 0) {
                        for (const cat of targetCategories) {
                            const formattedName = cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                            recommended.push(new action_template_entity_1.ActionTemplateEntity({
                                templateId: `TPL-AUTO-${cat.toUpperCase()}`,
                                groupId: cat.toUpperCase(),
                                title: `${formattedName} Remediation & Action Framework`,
                                description: `Targeted operational intervention to remediate low favorable sentiment in ${formattedName}.`,
                                category: cat.toUpperCase(),
                                suggestedMilestones: [
                                    `Conduct Diagnostic Root Cause Review for ${formattedName}`,
                                    `Deploy Manager Coaching & Concrete Action Commitments`,
                                    `Measure 60-Day Progress Pulse Indicator`,
                                ],
                            }));
                        }
                    }
                    // If no weak categories exist (e.g. all >= 85%), recommend excellence maintenance templates
                    if (targetCategories.length === 0) {
                        recommended.push(new action_template_entity_1.ActionTemplateEntity({
                            templateId: 'TPL-EXCELLENCE-01',
                            groupId: 'EXCELLENCE_MAINTENANCE',
                            title: 'High-Performance Culture & Innovation Lab',
                            description: 'Maintain high employee engagement by investing in cross-functional innovation sprints and peer recognition.',
                            category: 'EXCELLENCE_MAINTENANCE',
                            suggestedMilestones: [
                                'Launch Quarterly Innovation Pitch Sprints',
                                'Establish Peer-to-Peer Recognition Awards',
                                'Conduct Continuous Excellence Retrospective',
                            ],
                        }), new action_template_entity_1.ActionTemplateEntity({
                            templateId: 'TPL-LEAD-MAINT',
                            groupId: 'LEADERSHIP_ALIGNMENT',
                            title: 'Strategic Vision & Transparent Executive Dialogue',
                            description: 'Sustain strong organizational trust through transparent executive roadmaps and town halls.',
                            category: 'LEADERSHIP_ALIGNMENT',
                            suggestedMilestones: [
                                'Host Executive AMA Session',
                                'Publish Long-Term Strategic Horizon Roadmap',
                                'Conduct Annual High-Trust Leadership Summit',
                            ],
                        }));
                    }
                    if (groupId) {
                        const filtered = recommended.filter((t) => t.groupId.toLowerCase() === groupId.toLowerCase() ||
                            t.category?.toLowerCase() === groupId.toLowerCase());
                        if (filtered.length > 0)
                            return filtered;
                    }
                    return recommended;
                }
            }
        }
        return this.recommender.recommendTemplates(groupId, score);
    }
}
exports.GetRecommendedTemplatesUseCase = GetRecommendedTemplatesUseCase;
//# sourceMappingURL=get-recommended-templates.use-case.js.map