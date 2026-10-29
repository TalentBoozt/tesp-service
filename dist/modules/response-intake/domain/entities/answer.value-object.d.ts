export type QuestionType = 'LIKERT' | 'NPS' | 'RATING' | 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SHORT_TEXT' | 'LONG_TEXT' | 'SLIDER' | 'RANKING' | 'MATRIX';
export interface AnswerProps {
    questionId: string;
    questionType: QuestionType;
    groupId?: string;
    category?: string;
    numericValue?: number;
    textValue?: string;
    selectedOptions?: string[];
}
export declare class AnswerValueObject {
    readonly questionId: string;
    readonly questionType: QuestionType;
    readonly groupId?: string;
    readonly category?: string;
    readonly numericValue?: number;
    readonly textValue?: string;
    readonly selectedOptions?: string[];
    constructor(props: AnswerProps);
    toJSON(): AnswerProps;
}
