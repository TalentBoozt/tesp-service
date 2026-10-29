import { IKnowledgeRepository } from '../../domain/repositories/knowledge.repository.interface';
export interface PolicyDocument {
    documentId: string;
    projectId: string;
    title: string;
    category: 'WELLBEING' | 'LEADERSHIP' | 'COMPLIANCE' | 'FLEXIBLE_WORK' | 'GENERAL';
    content: string;
    vectorId?: string;
    createdAt: Date;
}
export interface PolicyMatchResult {
    matchedDocument: PolicyDocument;
    relevanceScore: number;
    policyAlignedActionSteps: string[];
}
export declare class KnowledgeEngineUseCase {
    private repository;
    constructor(repository?: IKnowledgeRepository);
    ingestPolicyDocument(projectId: string, title: string, category: PolicyDocument['category'], content: string): Promise<PolicyDocument>;
    matchPolicyContext(projectId: string, topicOrGroupId: string): Promise<PolicyMatchResult[]>;
}
