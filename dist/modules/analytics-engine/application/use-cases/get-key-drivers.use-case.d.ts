import { KeyDriver, AnomalyAlert } from '../../domain/services/ai-key-driver.service';
import { GetDashboardMetricsUseCase } from './get-dashboard-metrics.use-case';
import { IAnalyticalSnapshotRepository } from '../../domain/repositories/analytical-snapshot.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
export interface KeyDriversResult {
    campaignId: string;
    keyDrivers: KeyDriver[];
    anomalyAlerts: AnomalyAlert[];
}
export declare class GetKeyDriversUseCase {
    private getDashboardMetricsUseCase;
    private snapshotRepo?;
    private responseRepo?;
    private aiKeyDriverService;
    constructor(getDashboardMetricsUseCase: GetDashboardMetricsUseCase, snapshotRepo?: IAnalyticalSnapshotRepository | undefined, responseRepo?: ISurveyResponseRepository | undefined);
    execute(projectId: string, campaignId: string): Promise<KeyDriversResult>;
}
