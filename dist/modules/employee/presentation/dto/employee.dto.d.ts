import { z } from 'zod';
export declare const CreateEmployeeSchema: z.ZodEffects<z.ZodObject<{
    projectId: z.ZodString;
    employeeId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    nodeId: z.ZodString;
    matrixNodeIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    fullName: z.ZodString;
    phoneNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    nodeId: string;
    fullName: string;
    status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
    email?: string | undefined;
    employeeId?: string | undefined;
    phoneNumber?: string | undefined;
    matrixNodeIds?: string[] | undefined;
    attributes?: Record<string, any> | undefined;
}, {
    projectId: string;
    nodeId: string;
    fullName: string;
    status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
    email?: string | undefined;
    employeeId?: string | undefined;
    phoneNumber?: string | undefined;
    matrixNodeIds?: string[] | undefined;
    attributes?: Record<string, any> | undefined;
}>, {
    projectId: string;
    nodeId: string;
    fullName: string;
    status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
    email?: string | undefined;
    employeeId?: string | undefined;
    phoneNumber?: string | undefined;
    matrixNodeIds?: string[] | undefined;
    attributes?: Record<string, any> | undefined;
}, {
    projectId: string;
    nodeId: string;
    fullName: string;
    status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
    email?: string | undefined;
    employeeId?: string | undefined;
    phoneNumber?: string | undefined;
    matrixNodeIds?: string[] | undefined;
    attributes?: Record<string, any> | undefined;
}>;
export declare const UpdateEmployeeSchema: z.ZodObject<{
    nodeId: z.ZodOptional<z.ZodString>;
    matrixNodeIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    fullName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    nodeId?: string | undefined;
    matrixNodeIds?: string[] | undefined;
    fullName?: string | undefined;
    attributes?: Record<string, any> | undefined;
}, {
    status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    nodeId?: string | undefined;
    matrixNodeIds?: string[] | undefined;
    fullName?: string | undefined;
    attributes?: Record<string, any> | undefined;
}>;
export declare const BulkImportSchema: z.ZodObject<{
    autoTerminateMissing: z.ZodOptional<z.ZodBoolean>;
    records: z.ZodArray<z.ZodEffects<z.ZodObject<{
        employeeId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        nodeId: z.ZodString;
        matrixNodeIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        fullName: z.ZodString;
        phoneNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]>>;
        attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        nodeId: string;
        fullName: string;
        status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
        email?: string | undefined;
        employeeId?: string | undefined;
        phoneNumber?: string | undefined;
        matrixNodeIds?: string[] | undefined;
        attributes?: Record<string, any> | undefined;
    }, {
        nodeId: string;
        fullName: string;
        status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
        email?: string | undefined;
        employeeId?: string | undefined;
        phoneNumber?: string | undefined;
        matrixNodeIds?: string[] | undefined;
        attributes?: Record<string, any> | undefined;
    }>, {
        nodeId: string;
        fullName: string;
        status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
        email?: string | undefined;
        employeeId?: string | undefined;
        phoneNumber?: string | undefined;
        matrixNodeIds?: string[] | undefined;
        attributes?: Record<string, any> | undefined;
    }, {
        nodeId: string;
        fullName: string;
        status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
        email?: string | undefined;
        employeeId?: string | undefined;
        phoneNumber?: string | undefined;
        matrixNodeIds?: string[] | undefined;
        attributes?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    records: {
        nodeId: string;
        fullName: string;
        status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
        email?: string | undefined;
        employeeId?: string | undefined;
        phoneNumber?: string | undefined;
        matrixNodeIds?: string[] | undefined;
        attributes?: Record<string, any> | undefined;
    }[];
    autoTerminateMissing?: boolean | undefined;
}, {
    records: {
        nodeId: string;
        fullName: string;
        status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE" | "TERMINATED" | undefined;
        email?: string | undefined;
        employeeId?: string | undefined;
        phoneNumber?: string | undefined;
        matrixNodeIds?: string[] | undefined;
        attributes?: Record<string, any> | undefined;
    }[];
    autoTerminateMissing?: boolean | undefined;
}>;
