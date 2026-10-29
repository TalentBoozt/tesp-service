import { Request } from 'express';
import { TenantContextRequiredError } from '../../domain/errors/tenant-context-required.error';
export { TenantContextRequiredError };
/**
 * Resolves the tenant project ID strictly from request headers, user authentication context,
 * query parameters, or body.
 * If no tenant context is present or is invalid/generic, throws TenantContextRequiredError(400)
 * to prevent cross-tenant data leaks or silent hardcoded fallbacks (GAP-004 / GAP-023 / GAP-001).
 * Restricts header-based project override (x-project-id / x-tenant-id) to SUPER_ADMIN or authorized CONSULTANT.
 */
export declare function resolveTenantProjectId(req: Request, fallbackProjectId?: string): string;
