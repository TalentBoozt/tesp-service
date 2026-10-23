import { AnswerProps } from '../entities/answer.value-object';
export interface SurveyQuestionAst {
    questionId: string;
    type: string;
    isMandatory?: boolean;
    options?: {
        optionId: string;
        label: string;
    }[];
}
export declare class AnswerValidatorService {
    validateAnswers(answers: AnswerProps[], surveyQuestionsAst?: SurveyQuestionAst[]): void;
}
