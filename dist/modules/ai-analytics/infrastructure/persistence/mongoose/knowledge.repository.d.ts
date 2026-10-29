import { IKnowledgeRepository } from '../../../domain/repositories/knowledge.repository.interface';
import { PolicyDocument } from '../../../application/use-cases/knowledge-engine.use-case';
export declare class KnowledgeMongoRepository implements IKnowledgeRepository {
    private model;
    constructor(model?: any);
    save(doc: PolicyDocument): Promise<PolicyDocument>;
    findByProjectId(projectId: string, category?: string): Promise<PolicyDocument[]>;
    searchSimilar(projectId: string, query: string): Promise<PolicyDocument[]>;
}
export declare class InMemoryKnowledgeRepository implements IKnowledgeRepository {
    private static store;
    save(doc: PolicyDocument): Promise<PolicyDocument>;
    findByProjectId(projectId: string, category?: string): Promise<PolicyDocument[]>;
    searchSimilar(projectId: string, query: string): Promise<PolicyDocument[]>;
    static clear(): void;
}
