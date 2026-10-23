import { z } from 'zod';
export declare const DashboardQueryDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
    nodeId: z.ZodOptional<z.ZodString>;
    demographicFilters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    campaignId: string;
    nodeId?: string | undefined;
    demographicFilters?: Record<string, any> | undefined;
}, {
    projectId: string;
    campaignId: string;
    nodeId?: string | undefined;
    demographicFilters?: Record<string, any> | undefined;
}>;
export type DashboardQueryDto = z.infer<typeof DashboardQueryDtoSchema>;
export declare const HeatmapQueryDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
    parentNodeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    campaignId: string;
    parentNodeId?: string | undefined;
}, {
    projectId: string;
    campaignId: string;
    parentNodeId?: string | undefined;
}>;
export type HeatmapQueryDto = z.infer<typeof HeatmapQueryDtoSchema>;
