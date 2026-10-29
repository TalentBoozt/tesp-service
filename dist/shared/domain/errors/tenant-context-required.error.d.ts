import { AppError } from '../../presentation/middleware/error.middleware';
/**
 * Domain error thrown when a multi-tenant business operation is attempted
 * without an explicit, valid tenant project context.
 * Replaces dangerous silent fallbacks to default project IDs (GAP-004 / TASK-02-02).
 */
export declare class TenantContextRequiredError extends AppError {
    constructor(message?: string);
}
