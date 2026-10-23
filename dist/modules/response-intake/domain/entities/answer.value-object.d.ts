export type QuestionType = 'LIKERT' | 'NPS' | 'RATING' | 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SHORT_TEXT' | 'LONG_TEXT' | 'SLIDER' | 'RANKING' | 'MATRIX';
export interface AnswerProps {
    questionId: string;
    questionType: QuestionType;
    numericValue?: number;
    textValue?: string;
    selectedOptions?: string[];
}
export declare class AnswerValueObject {
    readonly questionId: string;
    readonly questionType: QuestionType;
    readonly numericValue?: number;
    readonly textValue?: string;
    readonly selectedOptions?: string[];
    constructor(props: AnswerProps);
    toJSON(): AnswerProps;
}
