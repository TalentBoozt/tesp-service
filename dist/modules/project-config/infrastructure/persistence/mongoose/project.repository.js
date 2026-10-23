"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMongoRepository = void 0;
const project_entity_1 = require("../../../domain/entities/project.entity");
const project_schema_1 = require("./project.schema");
class ProjectMongoRepository {
    toEntity(doc) {
        return new project_entity_1.ProjectEntity({
            projectId: doc.projectId,
            name: doc.name,
            status: doc.status,
            branding: {
                companyName: doc.branding.companyName,
                primaryColor: doc.branding.primaryColor,
                secondaryColor: doc.branding.secondaryColor,
                logoUrl: doc.branding.logoUrl,
                customCssUrl: doc.branding.customCssUrl,
            },
            supportedLocales: doc.supportedLocales,
            defaultLocale: doc.defaultLocale,
            features: doc.features,
            customAttributeDefinitions: doc.customAttributeDefinitions?.map((attr) => ({
                key: attr.key,
                displayName: attr.displayName,
                dataType: attr.dataType,
                allowedValues: attr.allowedValues,
            })),
            aiConfig: doc.aiConfig,
            emailConfig: doc.emailConfig,
            version: doc.version,
            isDeleted: doc.isDeleted,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async save(project) {
        const raw = project.toJSON();
        const doc = await project_schema_1.ProjectModel.findOneAndUpdate({ projectId: project.projectId }, {
            $set: {
                name: raw.name,
                status: raw.status,
                branding: raw.branding,
                supportedLocales: raw.supportedLocales,
                defaultLocale: raw.defaultLocale,
                features: raw.features,
                customAttributeDefinitions: raw.customAttributeDefinitions,
                aiConfig: raw.aiConfig,
                emailConfig: raw.emailConfig,
                version: raw.version,
                isDeleted: raw.isDeleted,
                updatedAt: raw.updatedAt,
            },
            $setOnInsert: {
                projectId: raw.projectId,
                createdAt: raw.createdAt,
            },
        }, { upsert: true, new: true, runValidators: true });
        return this.toEntity(doc);
    }
    async findByProjectId(projectId) {
        const doc = await project_schema_1.ProjectModel.findOne({ projectId, isDeleted: false });
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAll(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const query = { isDeleted: false };
        if (options?.status) {
            query.status = options.status;
        }
        const total = await project_schema_1.ProjectModel.countDocuments(query);
        const docs = await project_schema_1.ProjectModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        return {
            projects: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async existsByProjectId(projectId) {
        const count = await project_schema_1.ProjectModel.countDocuments({ projectId, isDeleted: false });
        return count > 0;
    }
    async softDelete(projectId) {
        const res = await project_schema_1.ProjectModel.updateOne({ projectId, isDeleted: false }, { $set: { isDeleted: true, status: 'ARCHIVED', updatedAt: new Date() }, $inc: { version: 1 } });
        return res.modifiedCount > 0;
    }
}
exports.ProjectMongoRepository = ProjectMongoRepository;
//# sourceMappingURL=project.repository.js.map