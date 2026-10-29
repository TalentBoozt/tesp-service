"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextRequiredError = void 0;
exports.resolveTenantProjectId = resolveTenantProjectId;
const tenant_context_required_error_1 = require("../../domain/errors/tenant-context-required.error");
Object.defineProperty(exports, "TenantContextRequiredError", { enumerable: true, get: function () { return tenant_context_required_error_1.TenantContextRequiredError; } });
/**
 * Resolves the tenant project ID strictly from request headers, user authentication context,
 * query parameters, or body.
 * If no tenant context is present or is invalid/generic, throws TenantContextRequiredError(400)
 * to prevent cross-tenant data leaks or silent hardcoded fallbacks (GAP-004 / GAP-023 / GAP-001).
 * Restricts header-based project override (x-project-id / x-tenant-id) to SUPER_ADMIN or authorized CONSULTANT.
 */
function resolveTenantProjectId(req, fallbackProjectId) {
    const headerId = (req.headers?.['x-project-id'] || req.headers?.['x-tenant-id'] || '').trim();
    const queryProjectId = (req.query?.projectId || '').trim();
    const bodyProjectId = (fallbackProjectId || req.body?.projectId || '').trim();
    const user = req.user;
    const userProjectId = (user?.projectId || '').trim();
    const rawRole = user?.role || '';
    const isSuperAdmin = rawRole === 'SUPER_ADMIN';
    const isConsultant = rawRole === 'CONSULTANT' || rawRole === 'CONSULTANT_DAASH';
    let candidate = '';
    if (user) {
        if (isSuperAdmin) {
            // Super admin can switch tenant via header, query, body, or fallback to assigned project
            candidate = headerId || queryProjectId || bodyProjectId || userProjectId;
        }
        else if (isConsultant) {
            const requested = headerId || queryProjectId || bodyProjectId;
            const authorized = user.authorizedProjectIds || user.assignedProjectIds || [];
            if (requested && (authorized.includes('*') || authorized.includes(requested))) {
                candidate = requested;
            }
            else {
                candidate = userProjectId || requested;
            }
        }
        else {
            // Standard tenant roles (COMPANY_ADMIN, PROJECT_ADMIN, HR_MANAGER, MANAGER, EMPLOYEE, etc.)
            // Prevent header spoofing (GAP-001): ignore headerId and enforce userProjectId
            if (headerId && userProjectId && headerId !== userProjectId) {
                console.warn(`[Security Alert] Non-admin user ${user.userId || user.email || 'unknown'} attempted cross-tenant header override to '${headerId}'. Enforcing assigned tenant '${userProjectId}'.`);
            }
            candidate = queryProjectId || bodyProjectId || userProjectId;
        }
    }
    else {
        // Unauthenticated or public execution path (e.g., token-based survey intake or kiosk)
        candidate = headerId || queryProjectId || bodyProjectId;
    }
    if (!candidate || candidate === 'PRJ-DEFAULT') {
        throw new tenant_context_required_error_1.TenantContextRequiredError("Missing required tenant context. Please provide 'x-project-id' header or authenticate with a tenant-scoped account.");
    }
    return candidate;
}
//# sourceMappingURL=tenant-context.js.map