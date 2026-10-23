import { ConsultingFirmEntity } from '../../../domain/entities/consulting-firm.entity';
export declare class MongoConsultingFirmRepository {
    private mapDocumentToEntity;
    findAll(): Promise<ConsultingFirmEntity[]>;
    findByFirmId(firmId: string): Promise<ConsultingFirmEntity | null>;
    findByConsultantUserId(userId: string): Promise<ConsultingFirmEntity | null>;
    findByAssignedProjectId(projectId: string): Promise<ConsultingFirmEntity[]>;
    save(firm: ConsultingFirmEntity): Promise<void>;
    count(): Promise<number>;
}
