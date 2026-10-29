"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgNodeController = void 0;
const org_node_dto_1 = require("../dto/org-node.dto");
const error_middleware_1 = require("../../../../shared/presentation/middleware/error.middleware");
const tenant_context_1 = require("../../../../shared/presentation/utils/tenant-context");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class OrgNodeController {
    createOrgNodeUseCase;
    moveOrgNodeUseCase;
    getOrgNodeUseCase;
    getSubTreeUseCase;
    getAncestorsUseCase;
    updateOrgNodeUseCase;
    deleteOrgNodeUseCase;
    listOrgNodesUseCase;
    constructor(createOrgNodeUseCase, moveOrgNodeUseCase, getOrgNodeUseCase, getSubTreeUseCase, getAncestorsUseCase, updateOrgNodeUseCase, deleteOrgNodeUseCase, listOrgNodesUseCase) {
        this.createOrgNodeUseCase = createOrgNodeUseCase;
        this.moveOrgNodeUseCase = moveOrgNodeUseCase;
        this.getOrgNodeUseCase = getOrgNodeUseCase;
        this.getSubTreeUseCase = getSubTreeUseCase;
        this.getAncestorsUseCase = getAncestorsUseCase;
        this.updateOrgNodeUseCase = updateOrgNodeUseCase;
        this.deleteOrgNodeUseCase = deleteOrgNodeUseCase;
        this.listOrgNodesUseCase = listOrgNodesUseCase;
    }
    enforceTenantAccess(req, targetProjectId) {
        if (!req.user)
            return;
        if (req.user.role === auth_middleware_1.UserRole.SUPER_ADMIN)
            return;
        const isDirectMatch = req.user.projectId === targetProjectId;
        const isAuthorizedMatch = Array.isArray(req.user.authorizedProjectIds) && req.user.authorizedProjectIds.includes(targetProjectId);
        if (!isDirectMatch && !isAuthorizedMatch) {
            throw new error_middleware_1.AppError(403, 'Access forbidden: Cross-tenant access is prohibited', 'https://tesp-api.talnova.io/errors/forbidden');
        }
    }
    createNode = async (req, res, next) => {
        try {
            const parsed = org_node_dto_1.CreateOrgNodeSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            this.enforceTenantAccess(req, parsed.data.projectId);
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const node = await this.createOrgNodeUseCase.execute(parsed.data, actorContext);
            res.status(201).json({ data: node.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    moveNode = async (req, res, next) => {
        try {
            const { nodeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const parsed = org_node_dto_1.MoveOrgNodeSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const updated = await this.moveOrgNodeUseCase.execute(projectId, nodeId, parsed.data.newParentId, actorContext);
            res.status(200).json({ data: updated.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    getNode = async (req, res, next) => {
        try {
            const { nodeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const node = await this.getOrgNodeUseCase.execute(projectId, nodeId);
            res.status(200).json({ data: node.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    getSubTree = async (req, res, next) => {
        try {
            const { nodeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const subTree = await this.getSubTreeUseCase.execute(projectId, nodeId);
            res.status(200).json({ data: subTree.map((n) => n.toJSON()), meta: { count: subTree.length } });
        }
        catch (err) {
            next(err);
        }
    };
    getAncestors = async (req, res, next) => {
        try {
            const { nodeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const ancestors = await this.getAncestorsUseCase.execute(projectId, nodeId);
            res.status(200).json({ data: ancestors.map((n) => n.toJSON()), meta: { count: ancestors.length } });
        }
        catch (err) {
            next(err);
        }
    };
    updateNode = async (req, res, next) => {
        try {
            const { nodeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const parsed = org_node_dto_1.UpdateOrgNodeSchema.safeParse(req.body);
            if (!parsed.success) {
                const detail = parsed.error.errors.map((e) => e.message).join('; ');
                throw new error_middleware_1.AppError(400, detail, 'https://tesp-api.talnova.io/errors/validation-failed');
            }
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            const updated = await this.updateOrgNodeUseCase.execute(projectId, nodeId, parsed.data, actorContext);
            res.status(200).json({ data: updated.toJSON() });
        }
        catch (err) {
            next(err);
        }
    };
    deleteNode = async (req, res, next) => {
        try {
            const { nodeId } = req.params;
            const projectId = (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const actorContext = req.user ? { actorId: req.user.userId, actorRole: req.user.role } : undefined;
            await this.deleteOrgNodeUseCase.execute(projectId, nodeId, actorContext);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
    listNodes = async (req, res, next) => {
        try {
            const projectId = req.params.projectId || (0, tenant_context_1.resolveTenantProjectId)(req);
            this.enforceTenantAccess(req, projectId);
            const parentId = req.query.parentId !== undefined
                ? req.query.parentId === 'null'
                    ? null
                    : req.query.parentId
                : undefined;
            const type = req.query.type;
            const nodes = await this.listOrgNodesUseCase.execute(projectId, { parentId, type });
            res.status(200).json({ data: nodes.map((n) => n.toJSON()), meta: { count: nodes.length } });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.OrgNodeController = OrgNodeController;
//# sourceMappingURL=org-node.controller.js.map