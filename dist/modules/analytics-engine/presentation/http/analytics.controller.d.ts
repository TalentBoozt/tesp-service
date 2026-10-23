import { Request, Response, NextFunction } from 'express';
import { GetDashboardMetricsUseCase } from '../../application/use-cases/get-dashboard-metrics.use-case';
import { GetHeatmapMatrixUseCase } from '../../application/use-cases/get-heatmap-matrix.use-case';
import { FreezeAnalyticalSnapshotUseCase } from '../../application/use-cases/freeze-analytical-snapshot.use-case';
import { GetKeyDriversUseCase } from '../../application/use-cases/get-key-drivers.use-case';
import { GetDashboardOverviewUseCase } from '../../application/use-cases/get-dashboard-overview.use-case';
export declare class AnalyticsController {
    private getDashboardMetricsUseCase;
    private getHeatmapMatrixUseCase;
    private freezeAnalyticalSnapshotUseCase;
    private getKeyDriversUseCase;
    private getDashboardOverviewUseCase;
    constructor(getDashboardMetricsUseCase: GetDashboardMetricsUseCase, getHeatmapMatrixUseCase: GetHeatmapMatrixUseCase, freezeAnalyticalSnapshotUseCase: FreezeAnalyticalSnapshotUseCase, getKeyDriversUseCase: GetKeyDriversUseCase, getDashboardOverviewUseCase?: GetDashboardOverviewUseCase);
    getOverview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHeatmap: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    freezeSnapshot: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getKeyDrivers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
