import { Request, Response, NextFunction } from 'express';
import { SubmitSurveyResponseUseCase } from '../../application/use-cases/submit-survey-response.use-case';
import { GetSurveyResponseUseCase } from '../../application/use-cases/get-survey-response.use-case';
import { ListSurveyResponsesUseCase } from '../../application/use-cases/list-survey-responses.use-case';
import { GetSurveyInstrumentUseCase } from '../../application/use-cases/get-survey-instrument.use-case';
import { ValidateAndBurnTokenUseCase } from '../../../survey-distribution/application/use-cases/validate-and-burn-token.use-case';
export declare class ResponseController {
    private submitSurveyResponseUseCase;
    private getSurveyResponseUseCase;
    private listSurveyResponsesUseCase;
    private getSurveyInstrumentUseCase?;
    private tokenValidator?;
    constructor(submitSurveyResponseUseCase: SubmitSurveyResponseUseCase, getSurveyResponseUseCase: GetSurveyResponseUseCase, listSurveyResponsesUseCase: ListSurveyResponsesUseCase, getSurveyInstrumentUseCase?: GetSurveyInstrumentUseCase | undefined, tokenValidator?: ValidateAndBurnTokenUseCase | undefined);
    getSurveyInstrument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    submitResponse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getResponse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listResponses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
