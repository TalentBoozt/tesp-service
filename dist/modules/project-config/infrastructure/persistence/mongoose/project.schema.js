"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProjectSchema = new mongoose_1.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        match: /^PRJ-[A-Z0-9_-]{3,20}$/,
        index: true,
    },
    name: { type: String, required: true },
    status: {
        type: String,
        enum: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'],
        default: 'ACTIVE',
    },
    branding: {
        companyName: { type: String, required: true },
        primaryColor: { type: String, required: true, match: /^#([A-Fa-f0-9]{6})$/ },
        secondaryColor: { type: String, required: true, match: /^#([A-Fa-f0-9]{6})$/ },
        logoUrl: { type: String },
        customCssUrl: { type: String },
    },
    supportedLocales: { type: [String], required: true },
    defaultLocale: { type: String, required: true },
    features: {
        aiAnalyticsEnabled: { type: Boolean, default: true },
        actionPlanningEnabled: { type: Boolean, default: true },
        kioskModeEnabled: { type: Boolean, default: false },
        smsDistributionEnabled: { type: Boolean, default: false },
    },
    aiConfig: {
        provider: { type: String, enum: ['OPENAI', 'GEMINI', 'ANTHROPIC', 'LOCAL_VLLM', 'MOCK'], default: 'GEMINI' },
        apiKey: { type: String },
        baseUrl: { type: String },
        modelName: { type: String, default: 'gemini-2.5-flash' },
        maxTokensPerAnalysis: { type: Number, default: 4000 },
        monthlyTokenBudget: { type: Number, default: 1000000 },
        currentMonthUsage: { type: Number, default: 0 },
        lastTestTimestamp: { type: Date },
        lastTestStatus: { type: String, enum: ['SUCCESS', 'FAILED'] },
    },
    emailConfig: {
        provider: {
            type: String,
            enum: ['ZOHO_ZEPTOMAIL_CPAAS', 'ZOHO_SMTP', 'GOOGLE_WORKSPACE_SMTP', 'CUSTOM_SMTP', 'SIMULATED'],
            default: 'SIMULATED',
        },
        fromName: { type: String, default: 'Talnova Survey Team' },
        fromEmail: { type: String, default: 'no-reply@talnova.io' },
        replyToEmail: { type: String },
        zeptoMailApiKey: { type: String },
        zeptoMailRegion: { type: String, enum: ['US', 'EU', 'IN', 'AU'], default: 'US' },
        smtpHost: { type: String },
        smtpPort: { type: Number },
        smtpUser: { type: String },
        smtpPassword: { type: String },
        useTls: { type: Boolean, default: true },
        dailySendLimit: { type: Number, default: 1000 },
        isDomainVerified: { type: Boolean, default: false },
        lastTestTimestamp: { type: Date },
        lastTestStatus: { type: String, enum: ['SUCCESS', 'FAILED'] },
        lastTestError: { type: String },
    },
    customAttributeDefinitions: [
        {
            key: { type: String, required: true },
            displayName: { type: String, required: true },
            dataType: { type: String, enum: ['STRING', 'NUMERIC', 'ENUM', 'DATE'], required: true },
            allowedValues: [{ type: String }],
        },
    ],
    tenantId: { type: String, default: 'TENANT-DAASH', index: true },
    tenantName: { type: String, default: 'Daash Global Advisory' },
    clientOrgName: { type: String },
    tier: {
        type: String,
        enum: ['ENTERPRISE', 'SCALE', 'GROWTH'],
        default: 'ENTERPRISE',
    },
    budgets: {
        monthlyResponseCap: { type: Number, default: 50000 },
        responsesConsumed: { type: Number, default: 0 },
        aiTokenCap: { type: Number, default: 1000000 },
        aiTokensConsumed: { type: Number, default: 0 },
        maxEmployees: { type: Number, default: 5000 },
        storageQuotaMb: { type: Number, default: 5000 },
    },
    licenseExpiresAt: { type: Date },
    customDomain: {
        hostname: { type: String },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        cnameTarget: { type: String },
        sslStatus: { type: String, enum: ['ACTIVE', 'PENDING_DNS', 'FAILED'], default: 'PENDING_DNS' },
    },
    samlConfig: {
        enabled: { type: Boolean, default: false },
        protocol: { type: String, enum: ['SAML_2', 'OIDC_PKCE'], default: 'SAML_2' },
        issuerUrl: { type: String },
        clientIdOrEntityId: { type: String },
        metadataUrlOrCert: { type: String },
        enforceSsoOnly: { type: Boolean, default: false },
        ssoLoginUrl: { type: String },
    },
    benchmarkSettings: {
        overallScoreBenchmark: { type: Number },
        dimensionBenchmarks: { type: mongoose_1.Schema.Types.Mixed },
    },
    version: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    collection: 'projects',
    timestamps: true,
});
// High-throughput compound index for active tenant lookups
ProjectSchema.index({ projectId: 1, isDeleted: 1, status: 1 });
exports.ProjectModel = mongoose_1.default.model('Project', ProjectSchema);
//# sourceMappingURL=project.schema.js.map