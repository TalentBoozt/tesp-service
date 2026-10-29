"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextRequiredError = void 0;
const error_middleware_1 = require("../../presentation/middleware/error.middleware");
/**
 * Domain error thrown when a multi-tenant business operation is attempted
 * without an explicit, valid tenant project context.
 * Replaces dangerous silent fallbacks to default project IDs (GAP-004 / TASK-02-02).
 */
class TenantContextRequiredError extends error_middleware_1.AppError {
    constructor(message = 'Tenant project context (projectId) is required for this operation') {
        super(400, message, 'https://tesp-api.talnova.io/errors/tenant-context-required', { code: 'ERR_MISSING_TENANT_CONTEXT' });
        this.name = 'TenantContextRequiredError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.TenantContextRequiredError = TenantContextRequiredError;
//# sourceMappingURL=tenant-context-required.error.js.map