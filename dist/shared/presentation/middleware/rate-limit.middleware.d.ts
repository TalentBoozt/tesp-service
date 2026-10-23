import { Request, Response } from 'express';
export declare function createRfc7807Handler(customMessage: string): (req: Request, res: Response) => void;
/**
 * Global API rate limiter: 120 requests per minute per IP
 * Protects platform from DoS while allowing rich interactive SPAs to poll
 */
export declare const globalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Authentication rate limiter: 10 requests per 15 minutes per IP
 * Protects /api/v1/auth/login against credential stuffing and brute force
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Public response intake & kiosk PIN rate limiter: 30 requests per minute per IP
 * Prevents automated kiosk PIN enumeration and survey ballot stuffing
 */
export declare const intakeRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
