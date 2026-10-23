"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRecommenderService = void 0;
const action_template_entity_1 = require("../entities/action-template.entity");
class TemplateRecommenderService {
    defaultCatalog = [
        new action_template_entity_1.ActionTemplateEntity({
            templateId: 'TPL-COMM-01',
            groupId: 'GRP-COMMUNICATION',
            title: 'Weekly Open Floor Huddle & Town Hall',
            description: 'Establish a weekly 30-minute open Q&A huddle with department leadership.',
            suggestedMilestones: [
                'Schedule recurring calendar invitation',
                'Create anonymous question submission box',
                'Hold first open floor huddle',
            ],
        }),
        new action_template_entity_1.ActionTemplateEntity({
            templateId: 'TPL-LEAD-01',
            groupId: 'GRP-LEADERSHIP',
            title: 'Leadership Alignment & Feedback Workshop',
            description: 'Conduct bi-weekly 1-on-1 check-ins and leadership alignment sessions.',
            suggestedMilestones: [
                'Schedule bi-weekly 1-on-1 meetings',
                'Define clear departmental OKRs',
                'Conduct monthly progress review',
            ],
        }),
        new action_template_entity_1.ActionTemplateEntity({
            templateId: 'TPL-WELL-01',
            groupId: 'GRP-WELLBEING',
            title: 'Workload Audit & Flexible Hours Protocol',
            description: 'Audit peak workload periods and implement flexible work hours.',
            suggestedMilestones: [
                'Survey team workload bottlenecks',
                'Establish core focus hours policy',
                'Review burnout metrics after 30 days',
            ],
        }),
    ];
    recommendTemplates(groupId, score) {
        if (!groupId)
            return this.defaultCatalog;
        const matched = this.defaultCatalog.filter((t) => t.groupId.toLowerCase() === groupId.toLowerCase() || groupId.includes(t.groupId.replace('GRP-', '')));
        return matched.length > 0 ? matched : this.defaultCatalog;
    }
}
exports.TemplateRecommenderService = TemplateRecommenderService;
//# sourceMappingURL=template-recommender.service.js.map