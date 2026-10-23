import { ClientEngagementEntity, IndustryBenchmarkEntity, ExecutiveWorkshopEntity, AiSignoffEntity } from '../entities/consultant.entities';
export interface IConsultantRepository {
    findEngagements(projectId?: string): Promise<ClientEngagementEntity[]>;
    findBenchmarks(sector?: string): Promise<IndustryBenchmarkEntity[]>;
    findWorkshops(projectId?: string): Promise<ExecutiveWorkshopEntity[]>;
    createWorkshop(workshop: Partial<ExecutiveWorkshopEntity>): Promise<ExecutiveWorkshopEntity>;
    findSignoffQueue(projectId?: string): Promise<AiSignoffEntity[]>;
    findSignoffById(id: string): Promise<AiSignoffEntity | null>;
    saveSignoff(entity: AiSignoffEntity): Promise<AiSignoffEntity>;
    seedDefaultsIfEmpty(): Promise<void>;
}
