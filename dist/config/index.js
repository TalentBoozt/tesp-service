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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoDbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tesp_config_db',
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL?.replace(/"/g, '') || '',
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/"/g, '') || '',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-testing-minimum-32-chars',
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.zoho.eu',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || 'no-reply@talnova.io',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'no-reply@talnova.io',
    },
    r2: {
        accountId: process.env.R2_ACCOUNT_ID || '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        bucket: process.env.R2_BUCKET || 'tesp-storage',
        publicUrl: process.env.R2_PUBLIC_URL || '',
        endpoint: process.env.R2_ENDPOINT || '',
        region: process.env.R2_REGION || 'auto',
    },
    security: {
        fieldEncryptionKey: process.env.FIELD_ENCRYPTION_KEY || 'tesp-field-encryption-master-secret-2026',
        blindIndexKey: process.env.BLIND_INDEX_KEY || 'tesp-blind-index-hmac-secret-2026',
    },
};
__exportStar(require("./environment"), exports);
//# sourceMappingURL=index.js.map