import { AnswerValueObject, AnswerProps } from './answer.value-object';
import { AnonymityLevel } from '../../../survey-distribution/domain/entities/campaign.entity';
export interface SurveyResponseProps {
    projectId: string;
    campaignId: string;
    surveyId: string;
    surveyVersion: number;
    responseId: string;
    respondentType: AnonymityLevel;
    responseToken?: string;
    nodeId?: string;
    matrixNodeIds?: string[];
    demographicSnapshot?: Record<string, any>;
    answers: (AnswerValueObject | AnswerProps)[];
    submittedAt?: Date;
    isDeleted?: boolean;
}
export declare class SurveyResponseEntity {
    readonly projectId: string;
    readonly campaignId: string;
    readonly surveyId: string;
    readonly surveyVersion: number;
    readonly responseId: string;
    readonly respondentType: AnonymityLevel;
    readonly responseToken?: string;
    readonly nodeId?: string;
    readonly matrixNodeIds: string[];
    readonly demographicSnapshot: Record<string, any>;
    readonly answers: AnswerValueObject[];
    readonly submittedAt: Date;
    readonly isDeleted: boolean;
    constructor(props: SurveyResponseProps);
    private validateResponseId;
    toJSON(): SurveyResponseProps;
}
