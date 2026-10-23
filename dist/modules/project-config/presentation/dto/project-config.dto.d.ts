import { z } from 'zod';
export declare const BrandingSchema: z.ZodObject<{
    companyName: z.ZodString;
    primaryColor: z.ZodString;
    secondaryColor: z.ZodString;
    logoUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    customCssUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string | undefined;
    customCssUrl?: string | undefined;
}, {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string | undefined;
    customCssUrl?: string | undefined;
}>;
export declare const CustomAttributeSchema: z.ZodEffects<z.ZodObject<{
    key: z.ZodString;
    displayName: z.ZodString;
    dataType: z.ZodEnum<["STRING", "NUMERIC", "ENUM", "DATE"]>;
    allowedValues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    key: string;
    displayName: string;
    dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
    allowedValues?: string[] | undefined;
}, {
    key: string;
    displayName: string;
    dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
    allowedValues?: string[] | undefined;
}>, {
    key: string;
    displayName: string;
    dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
    allowedValues?: string[] | undefined;
}, {
    key: string;
    displayName: string;
    dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
    allowedValues?: string[] | undefined;
}>;
export declare const CreateProjectSchema: z.ZodEffects<z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    clientOrgName: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "SUSPENDED", "ARCHIVED"]>>;
    branding: z.ZodObject<{
        companyName: z.ZodString;
        primaryColor: z.ZodString;
        secondaryColor: z.ZodString;
        logoUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        customCssUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    }, {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    }>;
    supportedLocales: z.ZodArray<z.ZodString, "many">;
    defaultLocale: z.ZodString;
    features: z.ZodOptional<z.ZodObject<{
        aiAnalyticsEnabled: z.ZodOptional<z.ZodBoolean>;
        actionPlanningEnabled: z.ZodOptional<z.ZodBoolean>;
        kioskModeEnabled: z.ZodOptional<z.ZodBoolean>;
        smsDistributionEnabled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        aiAnalyticsEnabled?: boolean | undefined;
        actionPlanningEnabled?: boolean | undefined;
        kioskModeEnabled?: boolean | undefined;
        smsDistributionEnabled?: boolean | undefined;
    }, {
        aiAnalyticsEnabled?: boolean | undefined;
        actionPlanningEnabled?: boolean | undefined;
        kioskModeEnabled?: boolean | undefined;
        smsDistributionEnabled?: boolean | undefined;
    }>>;
    customAttributeDefinitions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        key: z.ZodString;
        displayName: z.ZodString;
        dataType: z.ZodEnum<["STRING", "NUMERIC", "ENUM", "DATE"]>;
        allowedValues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }>, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    name: string;
    branding: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    };
    supportedLocales: string[];
    defaultLocale: string;
    status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | undefined;
    features?: {
        aiAnalyticsEnabled?: boolean | undefined;
        actionPlanningEnabled?: boolean | undefined;
        kioskModeEnabled?: boolean | undefined;
        smsDistributionEnabled?: boolean | undefined;
    } | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
    tenantId?: string | undefined;
    clientOrgName?: string | undefined;
}, {
    projectId: string;
    name: string;
    branding: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    };
    supportedLocales: string[];
    defaultLocale: string;
    status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | undefined;
    features?: {
        aiAnalyticsEnabled?: boolean | undefined;
        actionPlanningEnabled?: boolean | undefined;
        kioskModeEnabled?: boolean | undefined;
        smsDistributionEnabled?: boolean | undefined;
    } | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
    tenantId?: string | undefined;
    clientOrgName?: string | undefined;
}>, {
    projectId: string;
    name: string;
    branding: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    };
    supportedLocales: string[];
    defaultLocale: string;
    status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | undefined;
    features?: {
        aiAnalyticsEnabled?: boolean | undefined;
        actionPlanningEnabled?: boolean | undefined;
        kioskModeEnabled?: boolean | undefined;
        smsDistributionEnabled?: boolean | undefined;
    } | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
    tenantId?: string | undefined;
    clientOrgName?: string | undefined;
}, {
    projectId: string;
    name: string;
    branding: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    };
    supportedLocales: string[];
    defaultLocale: string;
    status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "ARCHIVED" | undefined;
    features?: {
        aiAnalyticsEnabled?: boolean | undefined;
        actionPlanningEnabled?: boolean | undefined;
        kioskModeEnabled?: boolean | undefined;
        smsDistributionEnabled?: boolean | undefined;
    } | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
    tenantId?: string | undefined;
    clientOrgName?: string | undefined;
}>;
export declare const UpdateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    branding: z.ZodOptional<z.ZodObject<{
        companyName: z.ZodString;
        primaryColor: z.ZodString;
        secondaryColor: z.ZodString;
        logoUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        customCssUrl: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    }, {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    }>>;
    supportedLocales: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    defaultLocale: z.ZodOptional<z.ZodString>;
    customAttributeDefinitions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        key: z.ZodString;
        displayName: z.ZodString;
        dataType: z.ZodEnum<["STRING", "NUMERIC", "ENUM", "DATE"]>;
        allowedValues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }>, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }, {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    branding?: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    } | undefined;
    supportedLocales?: string[] | undefined;
    defaultLocale?: string | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    branding?: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    } | undefined;
    supportedLocales?: string[] | undefined;
    defaultLocale?: string | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
}>, {
    name?: string | undefined;
    branding?: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    } | undefined;
    supportedLocales?: string[] | undefined;
    defaultLocale?: string | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    branding?: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string | undefined;
        customCssUrl?: string | undefined;
    } | undefined;
    supportedLocales?: string[] | undefined;
    defaultLocale?: string | undefined;
    customAttributeDefinitions?: {
        key: string;
        displayName: string;
        dataType: "STRING" | "NUMERIC" | "ENUM" | "DATE";
        allowedValues?: string[] | undefined;
    }[] | undefined;
}>;
export declare const ToggleFeaturesSchema: z.ZodObject<{
    aiAnalyticsEnabled: z.ZodOptional<z.ZodBoolean>;
    actionPlanningEnabled: z.ZodOptional<z.ZodBoolean>;
    kioskModeEnabled: z.ZodOptional<z.ZodBoolean>;
    smsDistributionEnabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    aiAnalyticsEnabled?: boolean | undefined;
    actionPlanningEnabled?: boolean | undefined;
    kioskModeEnabled?: boolean | undefined;
    smsDistributionEnabled?: boolean | undefined;
}, {
    aiAnalyticsEnabled?: boolean | undefined;
    actionPlanningEnabled?: boolean | undefined;
    kioskModeEnabled?: boolean | undefined;
    smsDistributionEnabled?: boolean | undefined;
}>;
