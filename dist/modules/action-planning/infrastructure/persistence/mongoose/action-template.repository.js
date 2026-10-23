"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTemplateMongoRepository = void 0;
const action_template_entity_1 = require("../../../domain/entities/action-template.entity");
const action_template_schema_1 = require("./action-template.schema");
class ActionTemplateMongoRepository {
    toEntity(doc) {
        return new action_template_entity_1.ActionTemplateEntity({
            templateId: doc.templateId,
            groupId: doc.groupId,
            title: doc.title,
            description: doc.description,
            suggestedMilestones: doc.suggestedMilestones,
        });
    }
    async save(template) {
        const raw = template.toJSON();
        const doc = await action_template_schema_1.ActionTemplateModel.findOneAndUpdate({ templateId: raw.templateId }, {
            $set: {
                groupId: raw.groupId,
                title: raw.title,
                description: raw.description,
                suggestedMilestones: raw.suggestedMilestones,
            },
            $setOnInsert: {
                templateId: raw.templateId,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByGroupId(groupId) {
        const docs = await action_template_schema_1.ActionTemplateModel.find({ groupId });
        return docs.map((doc) => this.toEntity(doc));
    }
    async findAll() {
        const docs = await action_template_schema_1.ActionTemplateModel.find({});
        return docs.map((doc) => this.toEntity(doc));
    }
}
exports.ActionTemplateMongoRepository = ActionTemplateMongoRepository;
//# sourceMappingURL=action-template.repository.js.map