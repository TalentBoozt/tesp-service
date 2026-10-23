import { ISurveyRepository } from '../../domain/repositories/survey.repository.interface';
import { SurveyEntity, ISurveyProps } from '../../domain/entities/survey.entity';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class CreateSurveyDraftUseCase {
    private surveyRepo;
    private eventBus;
    constructor(surveyRepo: ISurveyRepository, eventBus?: DomainEventBus);
    execute(props: ISurveyProps, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<SurveyEntity>;
}
