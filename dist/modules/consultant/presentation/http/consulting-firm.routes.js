"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsultingFirmRouter = createConsultingFirmRouter;
const express_1 = require("express");
const consulting_firm_entity_1 = require("../../domain/entities/consulting-firm.entity");
const mongo_consulting_firm_repository_1 = require("../../infrastructure/persistence/mongoose/mongo-consulting-firm.repository");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createConsultingFirmRouter(firmRepo = new mongo_consulting_firm_repository_1.MongoConsultingFirmRepository()) {
    const router = (0, express_1.Router)();
    // All endpoints require authentication
    router.use(auth_middleware_1.authenticate);
    // 1. Super Admin: List all consulting firms and assigned projects
    router.get('/admin/consultants', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN]), async (req, res) => {
        try {
            const firms = await firmRepo.findAll();
            return res.status(200).json({
                firms: firms.map(f => f.toJSON()),
                total: firms.length,
            });
        }
        catch (err) {
            return res.status(500).json({
                type: 'https://tesp-api.talnova.io/errors/internal-server-error',
                title: 'Database Error',
                status: 500,
                detail: err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 2. Super Admin: Register a new consulting partner firm
    router.post('/admin/consultants', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN]), async (req, res, next) => {
        try {
            // If this is a consultant user provisioning request (contains temporaryPassword or firstName), pass to next router
            if (req.body?.temporaryPassword || req.body?.firstName) {
                return next();
            }
            const { firmId, name, slug, contactEmail, tier, assignedProjectIds, consultantUserIds } = req.body || {};
            if (!name || !contactEmail) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'name and contactEmail are required.',
                    instance: req.originalUrl,
                });
            }
            const generatedFirmId = firmId || `FIRM-${Date.now().toString(36).toUpperCase()}`;
            const existing = await firmRepo.findByFirmId(generatedFirmId);
            if (existing) {
                return res.status(409).json({
                    type: 'https://tesp-api.talnova.io/errors/conflict',
                    title: 'Firm Already Exists',
                    status: 409,
                    detail: `Consulting firm with ID '${generatedFirmId}' already exists.`,
                    instance: req.originalUrl,
                });
            }
            const firm = new consulting_firm_entity_1.ConsultingFirmEntity({
                firmId: generatedFirmId,
                name,
                slug,
                contactEmail,
                tier: tier || 'ENTERPRISE',
                assignedProjectIds: assignedProjectIds || [],
                consultantUserIds: consultantUserIds || [],
            });
            await firmRepo.save(firm);
            return res.status(201).json(firm.toJSON());
        }
        catch (err) {
            return res.status(400).json({
                type: 'https://tesp-api.talnova.io/errors/invalid-firm-data',
                title: 'Validation Error',
                status: 400,
                detail: err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 3. Super Admin: Update project assignment matrix for a consulting firm
    router.put('/admin/consultants/:firmId/projects', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN]), async (req, res) => {
        try {
            const { firmId } = req.params;
            const { projectIds } = req.body || {};
            if (!Array.isArray(projectIds)) {
                return res.status(400).json({
                    type: 'https://tesp-api.talnova.io/errors/bad-request',
                    title: 'Bad Request',
                    status: 400,
                    detail: 'projectIds array is required.',
                    instance: req.originalUrl,
                });
            }
            const firm = await firmRepo.findByFirmId(firmId);
            if (!firm) {
                return res.status(404).json({
                    type: 'https://tesp-api.talnova.io/errors/not-found',
                    title: 'Not Found',
                    status: 404,
                    detail: `Consulting firm '${firmId}' not found.`,
                    instance: req.originalUrl,
                });
            }
            firm.setAssignedProjects(projectIds);
            await firmRepo.save(firm);
            return res.status(200).json({
                firmId: firm.firmId,
                name: firm.name,
                assignedProjectIds: firm.assignedProjectIds,
                updatedAt: firm.updatedAt,
            });
        }
        catch (err) {
            return res.status(500).json({
                type: 'https://tesp-api.talnova.io/errors/internal-server-error',
                title: 'Update Error',
                status: 500,
                detail: err.message,
                instance: req.originalUrl,
            });
        }
    });
    // 4. Consultant & Super Admin: Get portfolio of assigned client projects
    router.get('/consultant/portfolio', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.PROJECT_ADMIN]), async (req, res) => {
        try {
            const userRole = (0, auth_middleware_1.normalizeUserRole)(req.user.role);
            // If SUPER_ADMIN, return all consulting firms and projects
            if (userRole === auth_middleware_1.UserRole.SUPER_ADMIN) {
                const allFirms = await firmRepo.findAll();
                const allAssignedProjects = [
                    ...new Set(allFirms.flatMap(f => f.assignedProjectIds)),
                ];
                return res.status(200).json({
                    isSuperAdmin: true,
                    firmName: 'Global Platform Administration',
                    assignedProjectIds: allAssignedProjects,
                    firms: allFirms.map(f => ({
                        firmId: f.firmId,
                        name: f.name,
                        assignedProjectIds: f.assignedProjectIds,
                    })),
                });
            }
            // For CONSULTANT_DAASH, locate their firm
            let firm = await firmRepo.findByConsultantUserId(req.user.userId);
            // Fallback: Check firm FIRM-DAASH-01 if direct link isn't established yet
            if (!firm && userRole === auth_middleware_1.UserRole.CONSULTANT_DAASH) {
                firm = await firmRepo.findByFirmId('FIRM-DAASH-01');
            }
            if (!firm) {
                return res.status(200).json({
                    firmId: null,
                    firmName: 'Unassigned Advisory Firm',
                    assignedProjectIds: req.user?.projectId ? [req.user.projectId] : [],
                });
            }
            return res.status(200).json({
                firmId: firm.firmId,
                firmName: firm.name,
                tier: firm.tier,
                assignedProjectIds: firm.assignedProjectIds,
            });
        }
        catch (err) {
            return res.status(500).json({
                type: 'https://tesp-api.talnova.io/errors/internal-server-error',
                title: 'Portfolio Error',
                status: 500,
                detail: err.message,
                instance: req.originalUrl,
            });
        }
    });
    return router;
}
//# sourceMappingURL=consulting-firm.routes.js.map