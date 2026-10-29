"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryKnowledgeRepository = exports.KnowledgeMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const knowledge_document_schema_1 = require("./knowledge-document.schema");
class KnowledgeMongoRepository {
    model;
    constructor(model = knowledge_document_schema_1.KnowledgeDocumentModel) {
        this.model = model;
    }
    async save(doc) {
        const isMongoConnected = mongoose_1.default.connection?.readyState === 1;
        if (isMongoConnected) {
            await this.model.findOneAndUpdate({ documentId: doc.documentId }, {
                documentId: doc.documentId,
                projectId: doc.projectId,
                title: doc.title,
                category: doc.category,
                content: doc.content,
                vectorId: doc.vectorId,
                createdAt: doc.createdAt,
            }, { upsert: true, new: true });
        }
        return doc;
    }
    async findByProjectId(projectId, category) {
        const isMongoConnected = mongoose_1.default.connection?.readyState === 1;
        if (!isMongoConnected) {
            return [];
        }
        const query = { projectId };
        if (category) {
            query.category = category;
        }
        const res = await this.model.find(query);
        const docs = Array.isArray(res)
            ? res.map((d) => (d && typeof d.toObject === 'function' ? d.toObject() : d))
            : [];
        return docs.map((d) => ({
            documentId: d.documentId,
            projectId: d.projectId,
            title: d.title,
            category: d.category,
            content: d.content,
            vectorId: d.vectorId,
            createdAt: d.createdAt,
        }));
    }
    async searchSimilar(projectId, query) {
        const docs = await this.findByProjectId(projectId);
        if (!query || query.trim().length === 0)
            return docs;
        const qLower = query.toLowerCase();
        return docs.filter((d) => d.title.toLowerCase().includes(qLower) ||
            d.content.toLowerCase().includes(qLower) ||
            d.category.toLowerCase().includes(qLower));
    }
}
exports.KnowledgeMongoRepository = KnowledgeMongoRepository;
class InMemoryKnowledgeRepository {
    static store = new Map();
    async save(doc) {
        const list = InMemoryKnowledgeRepository.store.get(doc.projectId) || [];
        const idx = list.findIndex((d) => d.documentId === doc.documentId);
        if (idx >= 0) {
            list[idx] = doc;
        }
        else {
            list.push(doc);
        }
        InMemoryKnowledgeRepository.store.set(doc.projectId, list);
        return doc;
    }
    async findByProjectId(projectId, category) {
        const list = InMemoryKnowledgeRepository.store.get(projectId) || [];
        if (!category)
            return [...list];
        return list.filter((d) => d.category === category);
    }
    async searchSimilar(projectId, query) {
        const list = await this.findByProjectId(projectId);
        if (!query || query.trim().length === 0)
            return list;
        const qLower = query.toLowerCase();
        return list.filter((d) => d.title.toLowerCase().includes(qLower) ||
            d.content.toLowerCase().includes(qLower) ||
            d.category.toLowerCase().includes(qLower));
    }
    static clear() {
        InMemoryKnowledgeRepository.store.clear();
    }
}
exports.InMemoryKnowledgeRepository = InMemoryKnowledgeRepository;
//# sourceMappingURL=knowledge.repository.js.map