"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyTemplateMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const survey_template_schema_1 = require("./survey-template.schema");
class SurveyTemplateMongoRepository {
    async findAll(options) {
        if (mongoose_1.default.connection.readyState !== 1) {
            return [];
        }
        const query = {};
        if (options?.projectId && options.projectId !== 'GLOBAL') {
            query.$or = [
                { isPublic: true },
                { projectId: 'GLOBAL' },
                { projectId: options.projectId },
            ];
        }
        else {
            query.$or = [{ isPublic: true }, { projectId: 'GLOBAL' }];
        }
        if (options?.category && options.category !== 'ALL') {
            query.category = options.category;
        }
        return await survey_template_schema_1.SurveyTemplateModel.find(query).sort({ createdAt: -1 });
    }
    async findByTemplateId(templateId) {
        if (mongoose_1.default.connection.readyState !== 1) {
            return null;
        }
        return await survey_template_schema_1.SurveyTemplateModel.findOne({ templateId });
    }
    async save(template) {
        const doc = await survey_template_schema_1.SurveyTemplateModel.findOneAndUpdate({ templateId: template.templateId }, {
            $set: {
                name: template.name,
                category: template.category,
                description: template.description,
                targetAudience: template.targetAudience,
                estimatedTimeMinutes: template.estimatedTimeMinutes,
                questionCount: template.questionCount,
                sectionsCount: template.sectionsCount,
                tags: template.tags,
                isPublic: template.isPublic !== false,
                projectId: template.projectId || 'GLOBAL',
                pages: template.pages,
            },
        }, { upsert: true, new: true, runValidators: true });
        return doc;
    }
}
exports.SurveyTemplateMongoRepository = SurveyTemplateMongoRepository;
//# sourceMappingURL=survey-template.repository.js.map