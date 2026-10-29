import { Request } from 'express';
export declare const SNS_CERT_URL_PATTERN: RegExp;
export declare function clearSnsCertCache(): void;
export declare function setSnsCertInCache(url: string, pemCert: string): void;
/**
 * Reconstructs the AWS SNS canonical signing string per AWS specification.
 * Fields are written as name, newline, value, newline in deterministic order.
 */
export declare function buildSnsCanonicalString(body: Record<string, any>): string;
/**
 * Cryptographically verifies an inbound AWS SNS / SES webhook message.
 */
export declare function verifySnsSignature(body: Record<string, any>): Promise<boolean>;
/**
 * Cryptographically verifies an inbound Twilio webhook request using HMAC-SHA1.
 */
export declare function verifyTwilioSignature(req: Request, authToken?: string): boolean;
