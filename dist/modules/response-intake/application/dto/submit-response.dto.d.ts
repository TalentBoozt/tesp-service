import { z } from 'zod';
import { AnonymityLevel } from '../../../survey-distribution/domain/entities/campaign.entity';
export declare const SubmitAnswerDtoSchema: z.ZodObject<{
    questionId: z.ZodString;
    questionType: z.ZodEnum<["LIKERT", "NPS", "RATING", "SINGLE_CHOICE", "MULTI_CHOICE", "SHORT_TEXT", "LONG_TEXT", "SLIDER", "RANKING", "MATRIX"]>;
    numericValue: z.ZodOptional<z.ZodNumber>;
    textValue: z.ZodOptional<z.ZodString>;
    selectedOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    questionId: string;
    questionType: "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT" | "RATING" | "MULTI_CHOICE" | "SLIDER";
    numericValue?: number | undefined;
    textValue?: string | undefined;
    selectedOptions?: string[] | undefined;
}, {
    questionId: string;
    questionType: "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT" | "RATING" | "MULTI_CHOICE" | "SLIDER";
    numericValue?: number | undefined;
    textValue?: string | undefined;
    selectedOptions?: string[] | undefined;
}>;
export type SubmitAnswerDto = z.infer<typeof SubmitAnswerDtoSchema>;
export declare const SubmitResponseDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
    surveyId: z.ZodString;
    surveyVersion: z.ZodNumber;
    responseToken: z.ZodOptional<z.ZodString>;
    respondentType: z.ZodNativeEnum<typeof AnonymityLevel>;
    nodeId: z.ZodOptional<z.ZodString>;
    demographicSnapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    answers: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        questionType: z.ZodEnum<["LIKERT", "NPS", "RATING", "SINGLE_CHOICE", "MULTI_CHOICE", "SHORT_TEXT", "LONG_TEXT", "SLIDER", "RANKING", "MATRIX"]>;
        numericValue: z.ZodOptional<z.ZodNumber>;
        textValue: z.ZodOptional<z.ZodString>;
        selectedOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        questionType: "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT" | "RATING" | "MULTI_CHOICE" | "SLIDER";
        numericValue?: number | undefined;
        textValue?: string | undefined;
        selectedOptions?: string[] | undefined;
    }, {
        questionId: string;
        questionType: "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT" | "RATING" | "MULTI_CHOICE" | "SLIDER";
        numericValue?: number | undefined;
        textValue?: string | undefined;
        selectedOptions?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    surveyId: string;
    campaignId: string;
    surveyVersion: number;
    respondentType: AnonymityLevel;
    answers: {
        questionId: string;
        questionType: "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT" | "RATING" | "MULTI_CHOICE" | "SLIDER";
        numericValue?: number | undefined;
        textValue?: string | undefined;
        selectedOptions?: string[] | undefined;
    }[];
    nodeId?: string | undefined;
    responseToken?: string | undefined;
    demographicSnapshot?: Record<string, any> | undefined;
}, {
    projectId: string;
    surveyId: string;
    campaignId: string;
    surveyVersion: number;
    respondentType: AnonymityLevel;
    answers: {
        questionId: string;
        questionType: "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT" | "RATING" | "MULTI_CHOICE" | "SLIDER";
        numericValue?: number | undefined;
        textValue?: string | undefined;
        selectedOptions?: string[] | undefined;
    }[];
    nodeId?: string | undefined;
    responseToken?: string | undefined;
    demographicSnapshot?: Record<string, any> | undefined;
}>;
export type SubmitResponseDto = z.infer<typeof SubmitResponseDtoSchema>;
