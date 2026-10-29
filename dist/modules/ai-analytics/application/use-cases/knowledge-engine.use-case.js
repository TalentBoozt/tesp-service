"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeEngineUseCase = void 0;
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const knowledge_repository_1 = require("../../infrastructure/persistence/mongoose/knowledge.repository");
class KnowledgeEngineUseCase {
    repository;
    constructor(repository) {
        if (repository) {
            this.repository = repository;
        }
        else if (mongoose_1.default.connection?.readyState === 1) {
            this.repository = new knowledge_repository_1.KnowledgeMongoRepository();
        }
        else {
            this.repository = new knowledge_repository_1.InMemoryKnowledgeRepository();
        }
    }
    async ingestPolicyDocument(projectId, title, category, content) {
        const doc = {
            documentId: `DOC-POL-${(0, crypto_1.randomUUID)()}`,
            projectId,
            title,
            category,
            content,
            vectorId: `VEC-${(0, crypto_1.randomUUID)()}`,
            createdAt: new Date(),
        };
        await this.repository.save(doc);
        return doc;
    }
    async matchPolicyContext(projectId, topicOrGroupId) {
        const docs = await this.repository.findByProjectId(projectId);
        if (docs.length === 0) {
            // Default baseline enterprise policy match
            return [
                {
                    matchedDocument: {
                        documentId: 'DOC-POL-DEFAULT',
                        projectId,
                        title: 'Enterprise Flexible Working & Core Hours Policy',
                        category: 'FLEXIBLE_WORK',
                        content: 'Employees may utilize core focus hours (10:00 - 15:00) with flexible start and end times.',
                        createdAt: new Date(),
                    },
                    relevanceScore: 0.88,
                    policyAlignedActionSteps: [
                        'Establish 10:00 - 15:00 core focus hours for the department.',
                        'Review workload distribution using HR Policy Section 4.2 guidelines.',
                    ],
                },
            ];
        }
        return docs.map((doc) => ({
            matchedDocument: doc,
            relevanceScore: 0.92,
            policyAlignedActionSteps: [
                `Implement policy guidelines from '${doc.title}'.`,
                `Schedule manager review per ${doc.category} HR procedure.`,
            ],
        }));
    }
}
exports.KnowledgeEngineUseCase = KnowledgeEngineUseCase;
//# sourceMappingURL=knowledge-engine.use-case.js.map