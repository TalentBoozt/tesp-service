"use strict";
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
};
//# sourceMappingURL=index.js.map