import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { SurveyEntity } from '../../../domain/entities/survey.entity';
import { QuestionLibraryItemEntity } from '../../../domain/entities/question-library.entity';
export declare class SurveyMongoRepository implements ISurveyRepository {
    private toEntity;
    private toLibraryEntity;
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
