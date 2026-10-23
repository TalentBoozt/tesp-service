import { KeyDriver, AnomalyAlert } from '../../domain/services/ai-key-driver.service';
import { GetDashboardMetricsUseCase } from './get-dashboard-metrics.use-case';
import { IAnalyticalSnapshotRepository } from '../../domain/repositories/analytical-snapshot.repository.interface';
export interface KeyDriversResult {
    campaignId: string;
    keyDrivers: KeyDriver[];
    anomalyAlerts: AnomalyAlert[];
}
export declare class GetKeyDriversUseCase {
    private getDashboardMetricsUseCase;
    private snapshotRepo?;
    private aiKeyDriverService;
    constructor(getDashboardMetricsUseCase: GetDashboardMetricsUseCase, snapshotRepo?: IAnalyticalSnapshotRepository | undefined);
    execute(projectId: string, campaignId: string): Promise<KeyDriversResult>;
}
