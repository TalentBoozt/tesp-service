import { IAnalyticalSnapshotRepository } from '../../../domain/repositories/analytical-snapshot.repository.interface';
import { AnalyticalSnapshotEntity } from '../../../domain/entities/analytical-snapshot.entity';
export declare class AnalyticalSnapshotMongoRepository implements IAnalyticalSnapshotRepository {
    private toEntity;
    save(snapshot: AnalyticalSnapshotEntity): Promise<AnalyticalSnapshotEntity>;
    findByCampaignId(projectId: string, campaignId: string): Promise<AnalyticalSnapshotEntity | null>;
    findLatestBaseline(projectId: string, currentCampaignId: string): Promise<AnalyticalSnapshotEntity | null>;
}
