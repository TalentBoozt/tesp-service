import { IConsultantRepository } from '../../domain/repositories/consultant.repository.interface';
import { ClientEngagementEntity, IndustryBenchmarkEntity, ExecutiveWorkshopEntity, AiSignoffEntity } from '../../domain/entities/consultant.entities';
export declare class ListEngagementsUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(projectId?: string): Promise<ClientEngagementEntity[]>;
}
export declare class GetBenchmarksUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(sector?: string, _projectId?: string): Promise<IndustryBenchmarkEntity[]>;
}
export interface CreateWorkshopDto {
    projectId?: string;
    title: string;
    clientName: string;
    consultantLead?: string;
    scheduledDate?: string;
    status?: 'DRAFT' | 'READY_FOR_EXEC' | 'DELIVERED';
    keyThemes?: string[];
    recommendedInterventions?: string[];
    actionPlanIds?: string[];
}
export declare class CreateWorkshopUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(dto: CreateWorkshopDto): Promise<ExecutiveWorkshopEntity>;
}
export declare class ListWorkshopsUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(projectId?: string): Promise<ExecutiveWorkshopEntity[]>;
}
export declare class GetSignoffQueueUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(projectId?: string): Promise<AiSignoffEntity[]>;
}
export declare class SignoffAiFindingUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(findingId: string, notes: string, consultantEmail?: string): Promise<AiSignoffEntity>;
}
