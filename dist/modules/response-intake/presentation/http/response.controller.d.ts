import { Request, Response, NextFunction } from 'express';
import { SubmitSurveyResponseUseCase } from '../../application/use-cases/submit-survey-response.use-case';
import { GetSurveyResponseUseCase } from '../../application/use-cases/get-survey-response.use-case';
import { ListSurveyResponsesUseCase } from '../../application/use-cases/list-survey-responses.use-case';
export declare class ResponseController {
    private submitSurveyResponseUseCase;
    private getSurveyResponseUseCase;
    private listSurveyResponsesUseCase;
    constructor(submitSurveyResponseUseCase: SubmitSurveyResponseUseCase, getSurveyResponseUseCase: GetSurveyResponseUseCase, listSurveyResponsesUseCase: ListSurveyResponsesUseCase);
    submitResponse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getResponse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listResponses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
