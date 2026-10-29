import { PolicyDocument } from '../../application/use-cases/knowledge-engine.use-case';
export interface IKnowledgeRepository {
    save(doc: PolicyDocument): Promise<PolicyDocument>;
    findByProjectId(projectId: string, category?: string): Promise<PolicyDocument[]>;
    searchSimilar(projectId: string, query: string): Promise<PolicyDocument[]>;
}
