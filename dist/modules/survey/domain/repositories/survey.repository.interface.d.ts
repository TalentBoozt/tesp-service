import { SurveyEntity } from '../entities/survey.entity';
import { QuestionLibraryItemEntity } from '../entities/question-library.entity';
export interface ISurveyRepository {
    save(survey: SurveyEntity): Promise<SurveyEntity>;
    findBySurveyId(projectId: string, surveyId: string, version?: number): Promise<SurveyEntity | null>;
    findLatestPublishedVersion(projectId: string, surveyId: string): Promise<SurveyEntity | null>;
    findAll(projectId: string, options?: {
        status?: string;
    }): Promise<SurveyEntity[]>;
    existsBySurveyId(projectId: string, surveyId: string): Promise<boolean>;
    softDelete(projectId: string, surveyId: string): Promise<boolean>;
    saveLibraryItem(item: QuestionLibraryItemEntity): Promise<QuestionLibraryItemEntity>;
    findLibraryItems(projectId: string, category?: string): Promise<QuestionLibraryItemEntity[]>;
}
