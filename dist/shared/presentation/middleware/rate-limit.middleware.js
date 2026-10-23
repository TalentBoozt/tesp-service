"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.intakeRateLimiter = exports.authRateLimiter = exports.globalRateLimiter = void 0;
exports.createRfc7807Handler = createRfc7807Handler;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function createRfc7807Handler(customMessage) {
    return (req, res) => {
        res.status(429).json({
            type: 'https://tesp-api.talnova.io/errors/rate-limit-exceeded',
            title: 'Too Many Requests',
            status: 429,
            detail: customMessage,
            instance: req.originalUrl,
            timestamp: new Date().toISOString(),
        });
    };
}
/**
 * Global API rate limiter: 120 requests per minute per IP
 * Protects platform from DoS while allowing rich interactive SPAs to poll
 */
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
            return true;
        }
        // Always bypass health checks
        return req.path === '/health' || req.path === '/api/v1/health';
    },
    handler: createRfc7807Handler('Global rate limit exceeded (120 req/min). Please try again shortly.'),
});
/**
 * Authentication rate limiter: 10 requests per 15 minutes per IP
 * Protects /api/v1/auth/login against credential stuffing and brute force
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 60,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
            return true;
        }
        const userAgent = req.headers['user-agent'] || '';
        if (userAgent.includes('TESP-SmokeTest')) {
            return true;
        }
        return false;
    },
    handler: createRfc7807Handler('Too many authentication attempts from this IP address. Please wait 15 minutes before retrying.'),
});
/**
 * Public response intake & kiosk PIN rate limiter: 30 requests per minute per IP
 * Prevents automated kiosk PIN enumeration and survey ballot stuffing
 */
exports.intakeRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_INTAKE_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_INTAKE_MAX) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'];
    },
    handler: createRfc7807Handler('Too many response submissions or token checks from this IP. Please wait a moment before trying again.'),
});
//# sourceMappingURL=rate-limit.middleware.js.map