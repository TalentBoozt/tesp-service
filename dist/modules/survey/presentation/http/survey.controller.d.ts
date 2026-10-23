import { Request, Response, NextFunction } from 'express';
import { CreateSurveyDraftUseCase } from '../../application/use-cases/create-survey-draft.use-case';
import { PublishSurveyUseCase } from '../../application/use-cases/publish-survey.use-case';
import { CloneSurveyVersionUseCase } from '../../application/use-cases/clone-survey-version.use-case';
import { GetSurveyUseCase } from '../../application/use-cases/get-survey.use-case';
import { ListSurveysUseCase } from '../../application/use-cases/list-surveys.use-case';
import { DeleteSurveyUseCase } from '../../application/use-cases/delete-survey.use-case';
import { QuestionLibraryUseCase } from '../../application/use-cases/question-library.use-case';
export declare class SurveyController {
    private createSurveyDraftUseCase;
    private publishSurveyUseCase;
    private cloneSurveyVersionUseCase;
    private getSurveyUseCase;
    private listSurveysUseCase;
    private deleteSurveyUseCase;
    private questionLibraryUseCase;
    constructor(createSurveyDraftUseCase: CreateSurveyDraftUseCase, publishSurveyUseCase: PublishSurveyUseCase, cloneSurveyVersionUseCase: CloneSurveyVersionUseCase, getSurveyUseCase: GetSurveyUseCase, listSurveysUseCase: ListSurveysUseCase, deleteSurveyUseCase: DeleteSurveyUseCase, questionLibraryUseCase: QuestionLibraryUseCase);
    createDraft: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    saveDraft: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    publishSurvey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cloneSurvey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSurvey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listSurveys: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteSurvey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    saveLibraryItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLibraryItems: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
