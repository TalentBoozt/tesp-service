import { ClientEngagementEntity, IndustryBenchmarkEntity, ExecutiveWorkshopEntity, AiSignoffEntity } from '../entities/consultant.entities';
export interface IConsultantRepository {
    findEngagements(projectId?: string, firmId?: string): Promise<ClientEngagementEntity[]>;
    findBenchmarks(sector?: string, firmId?: string): Promise<IndustryBenchmarkEntity[]>;
    findWorkshops(projectId?: string, firmId?: string): Promise<ExecutiveWorkshopEntity[]>;
    createWorkshop(workshop: Partial<ExecutiveWorkshopEntity>): Promise<ExecutiveWorkshopEntity>;
    updateWorkshop(id: string, updates: Partial<ExecutiveWorkshopEntity>): Promise<ExecutiveWorkshopEntity | null>;
    deleteWorkshop(id: string): Promise<boolean>;
    findSignoffQueue(projectId?: string, firmId?: string): Promise<AiSignoffEntity[]>;
    findSignoffById(id: string): Promise<AiSignoffEntity | null>;
    saveSignoff(entity: AiSignoffEntity): Promise<AiSignoffEntity>;
    seedDefaultsIfEmpty(): Promise<void>;
}
