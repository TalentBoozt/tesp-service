import { ISurveyResponseRepository } from '../../domain/repositories/survey-response.repository.interface';
import { ValidateAndBurnTokenUseCase } from '../../../survey-distribution/application/use-cases/validate-and-burn-token.use-case';
import { AnonymityGuardService } from '../../domain/services/anonymity-guard.service';
import { SubmitResponseDto } from '../dto/submit-response.dto';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
import { ISurveyCampaignRepository } from '../../../survey-distribution/domain/repositories/campaign.repository.interface';
import { IEventBus } from '../../../../shared/domain/events/event-bus';
import { DuplicateSubmissionException } from '../../domain/errors/duplicate-submission.exception';
export { DuplicateSubmissionException };
export interface SubmitResponseResult {
    responseId: string;
    status: 'ACCEPTED';
    message: string;
}
export declare class SubmitSurveyResponseUseCase {
    private responseRepo;
    private tokenBurnUseCase?;
    private surveyRepo?;
    private campaignRepo?;
    private eventBus;
    private answerValidator;
    private piiScrubber;
    private anonymityGuard;
    constructor(responseRepo: ISurveyResponseRepository, tokenBurnUseCase?: ValidateAndBurnTokenUseCase | undefined, surveyRepo?: ISurveyRepository | undefined, campaignRepo?: ISurveyCampaignRepository | undefined, eventBus?: IEventBus, anonymityGuard?: AnonymityGuardService);
    execute(dto: SubmitResponseDto): Promise<SubmitResponseResult>;
}
