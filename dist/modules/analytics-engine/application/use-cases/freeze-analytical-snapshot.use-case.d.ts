import { IAnalyticalSnapshotRepository } from '../../domain/repositories/analytical-snapshot.repository.interface';
import { ISurveyResponseRepository } from '../../../response-intake/domain/repositories/survey-response.repository.interface';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
import { AnalyticalSnapshotEntity } from '../../domain/entities/analytical-snapshot.entity';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
export declare class FreezeAnalyticalSnapshotUseCase {
    private snapshotRepo;
    private responseRepo;
    private enpsCalculator;
    private engagementCalculator;
    private privacyGuard;
    private surveyRepo?;
    private eventBus;
    constructor(snapshotRepo: IAnalyticalSnapshotRepository, responseRepo: ISurveyResponseRepository, surveyRepoOrEventBus?: ISurveyRepository | IEventBus, eventBusOrSurveyRepo?: IEventBus | ISurveyRepository);
    execute(projectId: string, campaignId: string, surveyId: string): Promise<AnalyticalSnapshotEntity>;
}
