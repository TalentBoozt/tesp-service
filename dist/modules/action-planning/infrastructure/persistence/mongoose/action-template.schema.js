"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTemplateModel = void 0;
const mongoose_1 = require("mongoose");
const ActionTemplateSchema = new mongoose_1.Schema({
    templateId: { type: String, required: true, unique: true, index: true },
    groupId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    suggestedMilestones: [{ type: String }],
}, {
    timestamps: false,
    collection: 'action_templates',
});
exports.ActionTemplateModel = (0, mongoose_1.model)('ActionTemplate', ActionTemplateSchema);
//# sourceMappingURL=action-template.schema.js.map