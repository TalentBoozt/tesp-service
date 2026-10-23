"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsultantTenantGuard = createConsultantTenantGuard;
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
const mongo_consulting_firm_repository_1 = require("../../infrastructure/persistence/mongoose/mongo-consulting-firm.repository");
function createConsultantTenantGuard(firmRepo = new mongo_consulting_firm_repository_1.MongoConsultingFirmRepository()) {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                type: 'https://tesp-api.talnova.io/errors/unauthorized',
                title: 'Unauthorized',
                status: 401,
                detail: 'User session is missing.',
                instance: req.originalUrl,
            });
            return;
        }
        const effectiveRole = (0, auth_middleware_1.normalizeUserRole)(req.user.role);
        // Super Admin has global platform-wide access
        if (effectiveRole === auth_middleware_1.UserRole.SUPER_ADMIN) {
            return next();
        }
        // Only apply consulting firm portfolio guard to CONSULTANT roles
        if (effectiveRole !== auth_middleware_1.UserRole.CONSULTANT_DAASH) {
            return next();
        }
        const targetProjectId = req.params.projectId ||
            req.body?.projectId ||
            (typeof req.query.projectId === 'string' ? req.query.projectId : null) ||
            req.user.projectId;
        if (!targetProjectId) {
            return next();
        }
        try {
            // Find firm associated with this consultant user
            const firm = await firmRepo.findByConsultantUserId(req.user.userId);
            if (!firm) {
                res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/firm-not-associated',
                    title: 'Forbidden',
                    status: 403,
                    detail: `Consultant '${req.user.userId}' is not associated with an active advisory firm.`,
                    instance: req.originalUrl,
                });
                return;
            }
            if (!firm.isAssignedToProject(targetProjectId)) {
                res.status(403).json({
                    type: 'https://tesp-api.talnova.io/errors/consultant-project-unassigned',
                    title: 'Forbidden',
                    status: 403,
                    detail: `Consulting firm '${firm.name}' (${firm.firmId}) is not authorized to manage client project '${targetProjectId}'.`,
                    instance: req.originalUrl,
                });
                return;
            }
            next();
        }
        catch (err) {
            res.status(500).json({
                type: 'https://tesp-api.talnova.io/errors/internal-server-error',
                title: 'Guard Error',
                status: 500,
                detail: err.message,
                instance: req.originalUrl,
            });
        }
    };
}
//# sourceMappingURL=consultant-tenant.guard.js.map