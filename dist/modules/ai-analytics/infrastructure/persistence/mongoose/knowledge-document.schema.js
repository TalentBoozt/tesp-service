"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDocumentModel = exports.KnowledgeDocumentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.KnowledgeDocumentSchema = new mongoose_1.Schema({
    documentId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['WELLBEING', 'LEADERSHIP', 'COMPLIANCE', 'FLEXIBLE_WORK', 'GENERAL'],
        required: true,
    },
    content: { type: String, required: true },
    vectorId: { type: String, index: true },
    embedding: [{ type: Number }],
}, {
    timestamps: true,
    collection: 'ai_knowledge_documents',
});
exports.KnowledgeDocumentModel = (0, mongoose_1.model)('KnowledgeDocument', exports.KnowledgeDocumentSchema);
//# sourceMappingURL=knowledge-document.schema.js.map