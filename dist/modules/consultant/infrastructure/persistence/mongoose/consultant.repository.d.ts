import { IConsultantRepository } from '../../../domain/repositories/consultant.repository.interface';
import { ClientEngagementEntity, IndustryBenchmarkEntity, ExecutiveWorkshopEntity, AiSignoffEntity } from '../../../domain/entities/consultant.entities';
export declare class ConsultantMongoRepository implements IConsultantRepository {
    private isBootstrapped;
    private ensureBootstrap;
    findEngagements(projectId?: string): Promise<ClientEngagementEntity[]>;
    findBenchmarks(sector?: string): Promise<IndustryBenchmarkEntity[]>;
    findWorkshops(projectId?: string): Promise<ExecutiveWorkshopEntity[]>;
    createWorkshop(workshop: Partial<ExecutiveWorkshopEntity>): Promise<ExecutiveWorkshopEntity>;
    findSignoffQueue(projectId?: string): Promise<AiSignoffEntity[]>;
    findSignoffById(id: string): Promise<AiSignoffEntity | null>;
    saveSignoff(entity: AiSignoffEntity): Promise<AiSignoffEntity>;
    seedDefaultsIfEmpty(): Promise<void>;
}
