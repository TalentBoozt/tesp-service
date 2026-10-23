import { QuestionType, IQuestionOption } from './survey.entity';
export interface IQuestionLibraryItemProps {
    projectId: string;
    libraryItemId: string;
    category: string;
    groupId: string;
    type: QuestionType;
    prompt: Record<string, string>;
    options?: IQuestionOption[];
    isDeleted?: boolean;
    createdAt?: Date;
}
export declare class QuestionLibraryItemEntity {
    static LIBRARY_ID_REGEX: RegExp;
    readonly projectId: string;
    readonly libraryItemId: string;
    readonly category: string;
    readonly groupId: string;
    readonly type: QuestionType;
    readonly prompt: Record<string, string>;
    readonly options?: IQuestionOption[];
    readonly isDeleted: boolean;
    readonly createdAt: Date;
    constructor(props: IQuestionLibraryItemProps);
    toJSON(): {
        projectId: string;
        libraryItemId: string;
        category: string;
        groupId: string;
        type: QuestionType;
        prompt: Record<string, string>;
        options: IQuestionOption[] | undefined;
        isDeleted: boolean;
        createdAt: Date;
    };
}
