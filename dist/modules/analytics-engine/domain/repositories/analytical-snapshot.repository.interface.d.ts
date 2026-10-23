import { AnalyticalSnapshotEntity } from '../entities/analytical-snapshot.entity';
export interface IAnalyticalSnapshotRepository {
    save(snapshot: AnalyticalSnapshotEntity): Promise<AnalyticalSnapshotEntity>;
    findByCampaignId(projectId: string, campaignId: string): Promise<AnalyticalSnapshotEntity | null>;
    findLatestBaseline(projectId: string, currentCampaignId: string): Promise<AnalyticalSnapshotEntity | null>;
}
