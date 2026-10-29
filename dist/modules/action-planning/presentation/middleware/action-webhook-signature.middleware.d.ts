import { Request, Response, NextFunction } from 'express';
/**
 * Returns the configured webhook secret for Jira/Planner inbound integrations.
 */
export declare function getActionWebhookSecret(): string;
/**
 * Computes HMAC-SHA256 digest for incoming action webhook payloads.
 */
export declare function computeActionWebhookHmac(payload: any, secret?: string): string;
/**
 * Cryptographic HMAC signature verification middleware for Jira and Microsoft Planner webhooks (GAP-002).
 * Rejects missing or invalid signatures with HTTP 401 Unauthorized.
 */
export declare function verifyActionWebhookSignatureMiddleware(req: Request, _res: Response, next: NextFunction): void;
