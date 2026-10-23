import { ISurveyRepository } from '../../domain/repositories/survey.repository.interface';
import { QuestionLibraryItemEntity, IQuestionLibraryItemProps } from '../../domain/entities/question-library.entity';
export declare class QuestionLibraryUseCase {
    private surveyRepo;
    constructor(surveyRepo: ISurveyRepository);
    saveItem(props: IQuestionLibraryItemProps): Promise<QuestionLibraryItemEntity>;
    findItems(projectId: string, category?: string): Promise<QuestionLibraryItemEntity[]>;
}
