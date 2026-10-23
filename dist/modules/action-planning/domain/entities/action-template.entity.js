"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTemplateEntity = void 0;
class ActionTemplateEntity {
    templateId;
    groupId;
    title;
    description;
    suggestedMilestones;
    category;
    constructor(props) {
        this.templateId = props.templateId;
        this.groupId = props.groupId;
        this.title = props.title;
        this.description = props.description;
        this.suggestedMilestones = [...props.suggestedMilestones];
        this.category = props.category || props.groupId;
    }
    toJSON() {
        return {
            templateId: this.templateId,
            groupId: this.groupId,
            title: this.title,
            description: this.description,
            suggestedMilestones: [...this.suggestedMilestones],
            category: this.category,
        };
    }
}
exports.ActionTemplateEntity = ActionTemplateEntity;
//# sourceMappingURL=action-template.entity.js.map