import { Router } from 'express';
import { SocialStylesApplicationService } from '../../application/services/social-styles-application.service';
/**
 * Dedicated rate limiter for unauthenticated public respondent endpoints:
 * 30 requests per minute per IP address.
 */
export declare const socialStylesPublicRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare function createSocialStylesRouter(service?: SocialStylesApplicationService): Router;
