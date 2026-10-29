"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const survey_entity_1 = require("../../../domain/entities/survey.entity");
const question_library_entity_1 = require("../../../domain/entities/question-library.entity");
const survey_schema_1 = require("./survey.schema");
class SurveyMongoRepository {
    toEntity(doc) {
        return new survey_entity_1.SurveyEntity({
            projectId: doc.projectId,
            surveyId: doc.surveyId,
            version: doc.version,
            title: doc.title,
            description: doc.description,
            status: doc.status,
            pages: doc.pages,
            publishedAt: doc.publishedAt,
            versionHistory: doc.versionHistory,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    toLibraryEntity(doc) {
        return new question_library_entity_1.QuestionLibraryItemEntity({
            projectId: doc.projectId,
            libraryItemId: doc.libraryItemId,
            category: doc.category,
            groupId: doc.groupId,
            type: doc.type,
            prompt: doc.prompt,
            options: doc.options,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
        });
    }
    async save(survey) {
        const raw = survey.toJSON();
        const doc = await survey_schema_1.SurveyModel.findOneAndUpdate({ projectId: survey.projectId, surveyId: survey.surveyId, version: survey.version }, {
            $set: {
                title: raw.title,
                description: raw.description,
                status: raw.status,
                pages: raw.pages,
                publishedAt: raw.publishedAt,
                versionHistory: raw.versionHistory,
                isDeleted: raw.isDeleted,
                updatedAt: raw.updatedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                surveyId: raw.surveyId,
                version: raw.version,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findBySurveyId(projectId, surveyId, version) {
        if (mongoose_1.default.connection.readyState !== 1) {
            return null;
        }
        const query = { projectId, surveyId, isDeleted: false };
        if (version !== undefined) {
            query.version = version;
        }
        const doc = await survey_schema_1.SurveyModel.findOne(query).sort({ version: -1 });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findLatestPublishedVersion(projectId, surveyId) {
        const doc = await survey_schema_1.SurveyModel.findOne({
            projectId,
            surveyId,
            status: { $in: ['PUBLISHED', 'ACTIVE'] },
            isDeleted: false,
        }).sort({ version: -1 });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAll(projectId, options) {
        const query = { projectId, isDeleted: false };
        if (options?.status) {
            query.status = options.status.toUpperCase();
        }
        const docs = await survey_schema_1.SurveyModel.find(query).sort({ updatedAt: -1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async existsBySurveyId(projectId, surveyId) {
        const count = await survey_schema_1.SurveyModel.countDocuments({ projectId, surveyId, isDeleted: false });
        return count > 0;
    }
    async softDelete(projectId, surveyId) {
        const res = await survey_schema_1.SurveyModel.updateMany({ projectId, surveyId, isDeleted: false }, { $set: { isDeleted: true, status: 'ARCHIVED', updatedAt: new Date() } });
        return res.modifiedCount > 0;
    }
    async saveLibraryItem(item) {
        const raw = item.toJSON();
        const doc = await survey_schema_1.QuestionLibraryModel.findOneAndUpdate({ projectId: item.projectId, libraryItemId: item.libraryItemId }, {
            $set: {
                category: raw.category,
                groupId: raw.groupId,
                type: raw.type,
                prompt: raw.prompt,
                options: raw.options,
                isDeleted: raw.isDeleted,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                libraryItemId: raw.libraryItemId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toLibraryEntity(doc);
    }
    async findLibraryItems(projectId, category) {
        const query = { projectId, isDeleted: false };
        if (category) {
            query.category = category.toUpperCase();
        }
        const docs = await survey_schema_1.QuestionLibraryModel.find(query).sort({ createdAt: -1 });
        return docs.map((doc) => this.toLibraryEntity(doc));
    }
}
exports.SurveyMongoRepository = SurveyMongoRepository;
//# sourceMappingURL=survey.repository.js.map