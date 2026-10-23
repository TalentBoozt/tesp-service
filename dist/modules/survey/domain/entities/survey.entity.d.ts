export type SurveyStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type QuestionType = 'LIKERT' | 'NPS' | 'MATRIX' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RANKING' | 'SHORT_TEXT' | 'LONG_TEXT' | 'NUMERIC' | 'DATE';
export type LogicOperator = 'EQUALS' | 'NOT_EQUALS' | 'LESS_THAN' | 'GREATER_THAN' | 'IN';
export interface IBranchingLogicRule {
    ruleId: string;
    operator: LogicOperator;
    value: any;
    targetPageId: string;
}
export interface IQuestionOption {
    optionId: string;
    label: Record<string, string>;
    scoreValue?: number;
}
export interface IQuestionProps {
    questionId: string;
    type: QuestionType;
    groupId?: string;
    prompt: Record<string, string>;
    isMandatory?: boolean;
    options?: IQuestionOption[];
    logicRules?: IBranchingLogicRule[];
}
export interface ISectionProps {
    sectionId: string;
    title?: Record<string, string>;
    sectionOrder?: number;
    questions: IQuestionProps[];
}
export interface IPageProps {
    pageId: string;
    title?: Record<string, string>;
    pageOrder: number;
    sections: ISectionProps[];
}
export interface ISurveyProps {
    projectId: string;
    surveyId: string;
    version?: number;
    title: Record<string, string>;
    description?: Record<string, string>;
    status?: SurveyStatus;
    pages: IPageProps[];
    publishedAt?: Date | null;
    versionHistory?: Array<{
        version: number;
        publishedAt: Date;
        publishedBy?: string;
    }>;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class SurveyEntity {
    static SURVEY_ID_REGEX: RegExp;
    readonly projectId: string;
    readonly surveyId: string;
    private _version;
    private _title;
    private _description?;
    private _status;
    private _pages;
    private _publishedAt;
    private _versionHistory;
    private _isDeleted;
    readonly createdAt: Date;
    private _updatedAt;
    constructor(props: ISurveyProps);
    get version(): number;
    get title(): Record<string, string>;
    get description(): Record<string, string> | undefined;
    get status(): SurveyStatus;
    get pages(): IPageProps[];
    get publishedAt(): Date | null;
    get versionHistory(): {
        version: number;
        publishedAt: Date;
        publishedBy?: string;
    }[];
    get isDeleted(): boolean;
    get updatedAt(): Date;
    private validateQuestionGroups;
    updateDraft(params: {
        title?: Record<string, string>;
        description?: Record<string, string>;
        pages?: IPageProps[];
    }): void;
    publish(publisherId?: string): void;
    createDraftClone(): SurveyEntity;
    markAsDeleted(): void;
    toJSON(): {
        projectId: string;
        surveyId: string;
        version: number;
        title: Record<string, string>;
        description: Record<string, string> | undefined;
        status: SurveyStatus;
        pages: IPageProps[];
        publishedAt: Date | null;
        versionHistory: {
            version: number;
            publishedAt: Date;
            publishedBy?: string;
        }[];
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
