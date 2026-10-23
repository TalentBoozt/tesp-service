import { ISurveyResponseRepository } from '../../domain/repositories/survey-response.repository.interface';
import { ValidateAndBurnTokenUseCase } from '../../../survey-distribution/application/use-cases/validate-and-burn-token.use-case';
import { SubmitResponseDto } from '../dto/submit-response.dto';
import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
export interface SubmitResponseResult {
    responseId: string;
    status: 'ACCEPTED';
    message: string;
}
export declare class SubmitSurveyResponseUseCase {
    private responseRepo;
    private tokenBurnUseCase?;
    private surveyRepo?;
    private answerValidator;
    private piiScrubber;
    constructor(responseRepo: ISurveyResponseRepository, tokenBurnUseCase?: ValidateAndBurnTokenUseCase | undefined, surveyRepo?: ISurveyRepository | undefined);
    execute(dto: SubmitResponseDto): Promise<SubmitResponseResult>;
}
