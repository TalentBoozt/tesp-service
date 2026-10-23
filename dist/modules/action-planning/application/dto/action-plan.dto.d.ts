import { z } from 'zod';
export declare const MilestoneDtoSchema: z.ZodObject<{
    milestoneId: z.ZodString;
    title: z.ZodString;
    dueDate: z.ZodEffects<z.ZodString, Date, string>;
}, "strip", z.ZodTypeAny, {
    title: string;
    milestoneId: string;
    dueDate: Date;
}, {
    title: string;
    milestoneId: string;
    dueDate: string;
}>;
export declare const CreateActionPlanDtoSchema: z.ZodObject<{
    projectId: z.ZodString;
    campaignId: z.ZodString;
    nodeId: z.ZodString;
    groupId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assigneeId: z.ZodString;
    baselineScore: z.ZodNumber;
    targetScore: z.ZodNumber;
    targetCompletionDate: z.ZodEffects<z.ZodString, Date, string>;
    milestones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        milestoneId: z.ZodString;
        title: z.ZodString;
        dueDate: z.ZodEffects<z.ZodString, Date, string>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        milestoneId: string;
        dueDate: Date;
    }, {
        title: string;
        milestoneId: string;
        dueDate: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    nodeId: string;
    title: string;
    groupId: string;
    campaignId: string;
    assigneeId: string;
    baselineScore: number;
    targetScore: number;
    targetCompletionDate: Date;
    description?: string | undefined;
    milestones?: {
        title: string;
        milestoneId: string;
        dueDate: Date;
    }[] | undefined;
}, {
    projectId: string;
    nodeId: string;
    title: string;
    groupId: string;
    campaignId: string;
    assigneeId: string;
    baselineScore: number;
    targetScore: number;
    targetCompletionDate: string;
    description?: string | undefined;
    milestones?: {
        title: string;
        milestoneId: string;
        dueDate: string;
    }[] | undefined;
}>;
export type CreateActionPlanDto = z.infer<typeof CreateActionPlanDtoSchema>;
export declare const TransitionStatusDtoSchema: z.ZodObject<{
    targetStatus: z.ZodEnum<["DRAFT", "PROPOSED", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED", "VERIFIED", "CANCELLED"]>;
    reason: z.ZodOptional<z.ZodString>;
    postActionScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    targetStatus: "DRAFT" | "COMPLETED" | "CANCELLED" | "PROPOSED" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "VERIFIED";
    postActionScore?: number | undefined;
    reason?: string | undefined;
}, {
    targetStatus: "DRAFT" | "COMPLETED" | "CANCELLED" | "PROPOSED" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "VERIFIED";
    postActionScore?: number | undefined;
    reason?: string | undefined;
}>;
export type TransitionStatusDto = z.infer<typeof TransitionStatusDtoSchema>;
export declare const UpdateActionPlanDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    assigneeId: z.ZodOptional<z.ZodString>;
    targetScore: z.ZodOptional<z.ZodNumber>;
    targetCompletionDate: z.ZodOptional<z.ZodEffects<z.ZodString, Date, string>>;
    milestones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        milestoneId: z.ZodString;
        title: z.ZodString;
        dueDate: z.ZodEffects<z.ZodString, Date, string>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        milestoneId: string;
        dueDate: Date;
    }, {
        title: string;
        milestoneId: string;
        dueDate: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    assigneeId?: string | undefined;
    targetScore?: number | undefined;
    targetCompletionDate?: Date | undefined;
    milestones?: {
        title: string;
        milestoneId: string;
        dueDate: Date;
    }[] | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    assigneeId?: string | undefined;
    targetScore?: number | undefined;
    targetCompletionDate?: string | undefined;
    milestones?: {
        title: string;
        milestoneId: string;
        dueDate: string;
    }[] | undefined;
}>;
export type UpdateActionPlanDto = z.infer<typeof UpdateActionPlanDtoSchema>;
