"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = exports.envSchema = void 0;
exports.validateEnvironment = validateEnvironment;
const zod_1 = require("zod");
exports.envSchema = zod_1.z
    .object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    MONGODB_URI: zod_1.z.string({ required_error: 'MONGODB_URI is required' }).min(1, 'MONGODB_URI is required'),
    JWT_SECRET: zod_1.z.string({ required_error: 'JWT_SECRET is required' }).min(16, 'JWT_SECRET must be at least 16 characters in dev'),
    UPSTASH_REDIS_REST_URL: zod_1.z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().optional(),
    // Cloudflare R2 Cloud Object Storage Configuration
    R2_ACCOUNT_ID: zod_1.z.string().optional(),
    R2_ACCESS_KEY_ID: zod_1.z.string().optional(),
    R2_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    R2_BUCKET: zod_1.z.string().optional(),
    R2_PUBLIC_URL: zod_1.z.string().optional(),
    R2_ENDPOINT: zod_1.z.string().optional(),
    R2_REGION: zod_1.z.string().optional(),
    // CSFLE Field Encryption Keys (GAP-007 / TASK-01-03)
    FIELD_ENCRYPTION_KEY: zod_1.z.string().min(32).optional(),
    BLIND_INDEX_KEY: zod_1.z.string().min(32).optional(),
})
    .refine((data) => {
    if (data.NODE_ENV === 'production') {
        return (data.JWT_SECRET.length >= 32 &&
            !data.JWT_SECRET.includes('super-secret') &&
            !data.JWT_SECRET.includes('testing'));
    }
    return true;
}, {
    message: 'In production, JWT_SECRET must be at least 32 characters and cannot use default or test dev secret',
    path: ['JWT_SECRET'],
})
    .refine((data) => {
    if (data.NODE_ENV === 'production') {
        return (!!data.FIELD_ENCRYPTION_KEY &&
            data.FIELD_ENCRYPTION_KEY.length >= 32 &&
            data.FIELD_ENCRYPTION_KEY !== 'tesp-field-encryption-master-secret-2026');
    }
    return true;
}, {
    message: 'In production, FIELD_ENCRYPTION_KEY must be at least 32 characters and cannot use default placeholder secret',
    path: ['FIELD_ENCRYPTION_KEY'],
})
    .refine((data) => {
    if (data.NODE_ENV === 'production') {
        return (!!data.BLIND_INDEX_KEY &&
            data.BLIND_INDEX_KEY.length >= 32 &&
            data.BLIND_INDEX_KEY !== 'tesp-blind-index-hmac-secret-2026');
    }
    return true;
}, {
    message: 'In production, BLIND_INDEX_KEY must be at least 32 characters and cannot use default placeholder secret',
    path: ['BLIND_INDEX_KEY'],
});
function validateEnvironment(env = process.env) {
    const result = exports.envSchema.safeParse(env);
    if (!result.success) {
        const errorDetails = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new Error(`[Configuration Error] Environment validation failed: ${errorDetails}`);
    }
    return result.data;
}
exports.validateEnv = validateEnvironment;
//# sourceMappingURL=environment.js.map