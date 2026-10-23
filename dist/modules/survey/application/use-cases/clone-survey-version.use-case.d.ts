import { ISurveyRepository } from '../../domain/repositories/survey.repository.interface';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class CloneSurveyVersionUseCase {
    private surveyRepo;
    private eventBus;
    constructor(surveyRepo: ISurveyRepository, eventBus?: DomainEventBus);
    execute(projectId: string, surveyId: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<SurveyEntity>;
}
