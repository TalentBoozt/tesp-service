"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleFeaturesSchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.CustomAttributeSchema = exports.BrandingSchema = void 0;
const zod_1 = require("zod");
exports.BrandingSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1, 'Company name is required'),
    primaryColor: zod_1.z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid HEX color format for primaryColor. Expected format: #RRGGBB'),
    secondaryColor: zod_1.z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid HEX color format for secondaryColor. Expected format: #RRGGBB'),
    logoUrl: zod_1.z.string().url('Logo URL must be a valid URL').refine((url) => url.startsWith('https://'), 'Logo URL must use HTTPS').optional(),
    customCssUrl: zod_1.z.string().url('Custom CSS URL must be a valid URL').refine((url) => url.startsWith('https://'), 'Custom CSS URL must use HTTPS').optional(),
});
exports.CustomAttributeSchema = zod_1.z.object({
    key: zod_1.z.string().regex(/^[a-zA-Z0-9_]+$/, 'Attribute key must contain alphanumeric characters and underscores only'),
    displayName: zod_1.z.string().min(1, 'Attribute displayName is required'),
    dataType: zod_1.z.enum(['STRING', 'NUMERIC', 'ENUM', 'DATE']),
    allowedValues: zod_1.z.array(zod_1.z.string()).optional(),
}).refine((data) => {
    if (data.dataType === 'ENUM') {
        return Array.isArray(data.allowedValues) && data.allowedValues.length > 0;
    }
    return true;
}, { message: 'Custom attribute of type ENUM must provide at least one allowed value', path: ['allowedValues'] });
exports.CreateProjectSchema = zod_1.z.object({
    projectId: zod_1.z.string().regex(/^PRJ-[A-Z0-9_-]{3,20}$/, 'Invalid or duplicate Project ID. Expected format: ^PRJ-[A-Z0-9_-]{3,20}$'),
    name: zod_1.z.string().min(1, 'Project name is required'),
    clientOrgName: zod_1.z.string().optional(),
    tenantId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
    branding: exports.BrandingSchema,
    supportedLocales: zod_1.z.array(zod_1.z.string()).min(1, 'At least one supported locale required'),
    defaultLocale: zod_1.z.string().min(1, 'Default locale is required'),
    features: zod_1.z.object({
        aiAnalyticsEnabled: zod_1.z.boolean().optional(),
        actionPlanningEnabled: zod_1.z.boolean().optional(),
        kioskModeEnabled: zod_1.z.boolean().optional(),
        smsDistributionEnabled: zod_1.z.boolean().optional(),
    }).optional(),
    customAttributeDefinitions: zod_1.z.array(exports.CustomAttributeSchema).optional(),
}).refine((data) => data.supportedLocales.includes(data.defaultLocale), { message: 'Default locale must be present in supported locales', path: ['defaultLocale'] });
exports.UpdateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Project name cannot be empty').optional(),
    branding: exports.BrandingSchema.optional(),
    supportedLocales: zod_1.z.array(zod_1.z.string()).min(1, 'At least one supported locale required').optional(),
    defaultLocale: zod_1.z.string().min(1, 'Default locale is required').optional(),
    customAttributeDefinitions: zod_1.z.array(exports.CustomAttributeSchema).optional(),
}).refine((data) => {
    if (data.supportedLocales && data.defaultLocale) {
        return data.supportedLocales.includes(data.defaultLocale);
    }
    return true;
}, { message: 'Default locale must be present in supported locales', path: ['defaultLocale'] });
exports.ToggleFeaturesSchema = zod_1.z.object({
    aiAnalyticsEnabled: zod_1.z.boolean().optional(),
    actionPlanningEnabled: zod_1.z.boolean().optional(),
    kioskModeEnabled: zod_1.z.boolean().optional(),
    smsDistributionEnabled: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=project-config.dto.js.map