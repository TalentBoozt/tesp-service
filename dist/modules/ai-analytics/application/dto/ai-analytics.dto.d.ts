import { z } from 'zod';
export declare const AnalyzeTextResponsesDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    campaignId: string;
}, {
    projectId: string;
    campaignId: string;
}>;
export type AnalyzeTextResponsesDto = z.infer<typeof AnalyzeTextResponsesDtoSchema>;
export declare const OverrideSentimentDtoSchema: z.ZodObject<{
    newSentimentLabel: z.ZodEnum<["POSITIVE", "NEUTRAL", "NEGATIVE"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    newSentimentLabel: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    reason?: string | undefined;
}, {
    newSentimentLabel: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    reason?: string | undefined;
}>;
export type OverrideSentimentDto = z.infer<typeof OverrideSentimentDtoSchema>;
