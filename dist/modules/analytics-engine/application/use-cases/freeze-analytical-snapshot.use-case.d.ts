import { IAnalyticalSnapshotRepository } from '../../domain/repositories/analytical-snapshot.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { AnalyticalSnapshotEntity } from '../../domain/entities/analytical-snapshot.entity';
export declare class FreezeAnalyticalSnapshotUseCase {
    private snapshotRepo;
    private responseRepo;
    private enpsCalculator;
    private engagementCalculator;
    private privacyGuard;
    constructor(snapshotRepo: IAnalyticalSnapshotRepository, responseRepo: ISurveyResponseRepository);
    execute(projectId: string, campaignId: string, surveyId: string): Promise<AnalyticalSnapshotEntity>;
}
