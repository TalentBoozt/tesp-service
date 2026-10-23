import { z } from 'zod';
export declare const CreateOrgNodeSchema: z.ZodObject<{
    projectId: z.ZodString;
    nodeId: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    displayOrder: z.ZodOptional<z.ZodNumber>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    name: string;
    type: string;
    nodeId: string;
    attributes?: Record<string, any> | undefined;
    parentId?: string | null | undefined;
    displayOrder?: number | undefined;
}, {
    projectId: string;
    name: string;
    type: string;
    nodeId: string;
    attributes?: Record<string, any> | undefined;
    parentId?: string | null | undefined;
    displayOrder?: number | undefined;
}>;
export declare const MoveOrgNodeSchema: z.ZodObject<{
    newParentId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    newParentId: string | null;
}, {
    newParentId: string | null;
}>;
export declare const UpdateOrgNodeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    displayOrder: z.ZodOptional<z.ZodNumber>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: string | undefined;
    attributes?: Record<string, any> | undefined;
    displayOrder?: number | undefined;
}, {
    name?: string | undefined;
    type?: string | undefined;
    attributes?: Record<string, any> | undefined;
    displayOrder?: number | undefined;
}>;
