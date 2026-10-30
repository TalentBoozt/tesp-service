import mongoose, { Document } from 'mongoose';
export interface IProjectDocument extends Document {
    projectId: string;
    name: string;
    status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
    branding: {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string;
        customCssUrl?: string;
    };
    supportedLocales: string[];
    defaultLocale: string;
    features: {
        aiAnalyticsEnabled: boolean;
        actionPlanningEnabled: boolean;
        kioskModeEnabled: boolean;
        smsDistributionEnabled: boolean;
    };
    customAttributeDefinitions: Array<{
        key: string;
        displayName: string;
        dataType: 'STRING' | 'NUMERIC' | 'ENUM' | 'DATE';
        allowedValues?: string[];
    }>;
    aiConfig?: {
        provider: 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'LOCAL_VLLM' | 'MOCK';
        apiKey?: string;
        baseUrl?: string;
        modelName?: string;
        maxTokensPerAnalysis?: number;
        monthlyTokenBudget?: number;
        currentMonthUsage?: number;
        lastTestTimestamp?: Date;
        lastTestStatus?: 'SUCCESS' | 'FAILED';
    };
    emailConfig?: {
        provider: 'ZOHO_ZEPTOMAIL_CPAAS' | 'ZOHO_SMTP' | 'GOOGLE_WORKSPACE_SMTP' | 'CUSTOM_SMTP' | 'SIMULATED';
        fromName: string;
        fromEmail: string;
        replyToEmail?: string;
        zeptoMailApiKey?: string;
        zeptoMailRegion?: 'US' | 'EU' | 'IN' | 'AU';
        smtpHost?: string;
        smtpPort?: number;
        smtpUser?: string;
        smtpPassword?: string;
        useTls?: boolean;
        dailySendLimit?: number;
        isDomainVerified?: boolean;
        lastTestTimestamp?: Date;
        lastTestStatus?: 'SUCCESS' | 'FAILED';
        lastTestError?: string;
    };
    tenantId?: string;
    tenantName?: string;
    consultantFirmId?: string;
    clientOrgName?: string;
    tier?: 'ENTERPRISE' | 'SCALE' | 'GROWTH';
    budgets?: {
        monthlyResponseCap: number;
        responsesConsumed: number;
        aiTokenCap: number;
        aiTokensConsumed: number;
        maxEmployees: number;
        storageQuotaMb: number;
    };
    licenseExpiresAt?: Date;
    customDomain?: {
        hostname: string;
        verified: boolean;
        verifiedAt?: Date;
        cnameTarget?: string;
        sslStatus?: 'ACTIVE' | 'PENDING_DNS' | 'FAILED';
    };
    samlConfig?: {
        enabled: boolean;
        protocol?: 'SAML_2' | 'OIDC_PKCE';
        issuerUrl?: string;
        clientIdOrEntityId?: string;
        metadataUrlOrCert?: string;
        enforceSsoOnly?: boolean;
        ssoLoginUrl?: string;
    };
    benchmarkSettings?: {
        overallScoreBenchmark?: number;
        dimensionBenchmarks?: Record<string, number>;
    };
    version: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProjectModel: mongoose.Model<IProjectDocument, {}, {}, {}, mongoose.Document<unknown, {}, IProjectDocument, {}, {}> & IProjectDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
