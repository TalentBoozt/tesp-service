"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConsultingFirmRepository = void 0;
const consulting_firm_entity_1 = require("../../../domain/entities/consulting-firm.entity");
const consulting_firm_schema_1 = require("./consulting-firm.schema");
class MongoConsultingFirmRepository {
    mapDocumentToEntity(doc) {
        return new consulting_firm_entity_1.ConsultingFirmEntity({
            firmId: doc.firmId,
            name: doc.name,
            slug: doc.slug,
            contactEmail: doc.contactEmail,
            tier: doc.tier,
            assignedProjectIds: doc.assignedProjectIds || [],
            consultantUserIds: doc.consultantUserIds || [],
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    async findAll() {
        const docs = await consulting_firm_schema_1.ConsultingFirmModel.find().sort({ createdAt: -1 }).exec();
        return docs.map(doc => this.mapDocumentToEntity(doc));
    }
    async findByFirmId(firmId) {
        const doc = await consulting_firm_schema_1.ConsultingFirmModel.findOne({ firmId }).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async findByConsultantUserId(userId) {
        const doc = await consulting_firm_schema_1.ConsultingFirmModel.findOne({ consultantUserIds: userId }).exec();
        if (!doc)
            return null;
        return this.mapDocumentToEntity(doc);
    }
    async findByAssignedProjectId(projectId) {
        const docs = await consulting_firm_schema_1.ConsultingFirmModel.find({ assignedProjectIds: projectId }).exec();
        return docs.map(doc => this.mapDocumentToEntity(doc));
    }
    async save(firm) {
        await consulting_firm_schema_1.ConsultingFirmModel.findOneAndUpdate({ firmId: firm.firmId }, {
            firmId: firm.firmId,
            name: firm.name,
            slug: firm.slug,
            contactEmail: firm.contactEmail,
            tier: firm.tier,
            assignedProjectIds: firm.assignedProjectIds,
            consultantUserIds: firm.consultantUserIds,
            isActive: firm.isActive,
        }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    }
    async count() {
        return consulting_firm_schema_1.ConsultingFirmModel.countDocuments().exec();
    }
}
exports.MongoConsultingFirmRepository = MongoConsultingFirmRepository;
//# sourceMappingURL=mongo-consulting-firm.repository.js.map