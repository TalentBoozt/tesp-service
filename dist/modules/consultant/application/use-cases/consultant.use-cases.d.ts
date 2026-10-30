import { IConsultantRepository } from '../../domain/repositories/consultant.repository.interface';
import { ClientEngagementEntity, IndustryBenchmarkEntity, ExecutiveWorkshopEntity, AiSignoffEntity } from '../../domain/entities/consultant.entities';
export declare class ListEngagementsUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(projectId?: string, firmId?: string): Promise<ClientEngagementEntity[]>;
}
export declare class GetBenchmarksUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(sector?: string, projectId?: string, firmId?: string): Promise<IndustryBenchmarkEntity[]>;
}
export interface CreateWorkshopDto {
    firmId?: string;
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
export interface UpdateWorkshopDto {
    title?: string;
    clientName?: string;
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
export declare class UpdateWorkshopUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(id: string, updates: UpdateWorkshopDto): Promise<ExecutiveWorkshopEntity>;
}
export declare class DeleteWorkshopUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(id: string): Promise<boolean>;
}
export declare class ListWorkshopsUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(projectId?: string, firmId?: string): Promise<ExecutiveWorkshopEntity[]>;
}
export declare class GetSignoffQueueUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(projectId?: string, firmId?: string): Promise<AiSignoffEntity[]>;
}
export declare class SignoffAiFindingUseCase {
    private consultantRepo;
    constructor(consultantRepo: IConsultantRepository);
    execute(findingId: string, notes: string, consultantEmail?: string): Promise<AiSignoffEntity>;
}
export interface AiThemeSynthesisResult {
    projectId: string;
    topThemes: string[];
    recommendedInterventions: string[];
    sentimentSummary: {
        positivePercent: number;
        neutralPercent: number;
        negativePercent: number;
    };
    criticalRisksCount: number;
    sampleInsightsCount: number;
}
export declare class GetAiThemesUseCase {
    execute(projectId: string): Promise<AiThemeSynthesisResult>;
}
