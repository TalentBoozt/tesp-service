"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrgNodeRouter = createOrgNodeRouter;
const express_1 = require("express");
const org_node_repository_1 = require("../../infrastructure/persistence/mongoose/org-node.repository");
const create_org_node_use_case_1 = require("../../application/use-cases/create-org-node.use-case");
const move_org_node_use_case_1 = require("../../application/use-cases/move-org-node.use-case");
const get_org_node_use_case_1 = require("../../application/use-cases/get-org-node.use-case");
const get_sub_tree_use_case_1 = require("../../application/use-cases/get-sub-tree.use-case");
const get_ancestors_use_case_1 = require("../../application/use-cases/get-ancestors.use-case");
const update_org_node_use_case_1 = require("../../application/use-cases/update-org-node.use-case");
const delete_org_node_use_case_1 = require("../../application/use-cases/delete-org-node.use-case");
const list_org_nodes_use_case_1 = require("../../application/use-cases/list-org-nodes.use-case");
const org_node_controller_1 = require("./org-node.controller");
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
function createOrgNodeRouter(repo) {
    const router = (0, express_1.Router)();
    const repository = repo || new org_node_repository_1.OrgNodeMongoRepository();
    const createOrgNodeUseCase = new create_org_node_use_case_1.CreateOrgNodeUseCase(repository);
    const moveOrgNodeUseCase = new move_org_node_use_case_1.MoveOrgNodeUseCase(repository);
    const getOrgNodeUseCase = new get_org_node_use_case_1.GetOrgNodeUseCase(repository);
    const getSubTreeUseCase = new get_sub_tree_use_case_1.GetSubTreeUseCase(repository);
    const getAncestorsUseCase = new get_ancestors_use_case_1.GetAncestorsUseCase(repository);
    const updateOrgNodeUseCase = new update_org_node_use_case_1.UpdateOrgNodeUseCase(repository);
    const deleteOrgNodeUseCase = new delete_org_node_use_case_1.DeleteOrgNodeUseCase(repository);
    const listOrgNodesUseCase = new list_org_nodes_use_case_1.ListOrgNodesUseCase(repository);
    const controller = new org_node_controller_1.OrgNodeController(createOrgNodeUseCase, moveOrgNodeUseCase, getOrgNodeUseCase, getSubTreeUseCase, getAncestorsUseCase, updateOrgNodeUseCase, deleteOrgNodeUseCase, listOrgNodesUseCase);
    router.use('/nodes', auth_middleware_1.authenticate);
    router.post('/nodes', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.createNode);
    router.get('/nodes', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.listNodes);
    router.get('/nodes/:nodeId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.getNode);
    router.put('/nodes/:nodeId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.updateNode);
    router.post('/nodes/:nodeId/move', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.moveNode);
    router.get('/nodes/:nodeId/subtree', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.getSubTree);
    router.get('/nodes/:nodeId/ancestors', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN, auth_middleware_1.UserRole.HR_MANAGER]), controller.getAncestors);
    router.delete('/nodes/:nodeId', (0, auth_middleware_1.authorize)([auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.CONSULTANT_DAASH, auth_middleware_1.UserRole.ORG_ADMIN]), controller.deleteNode);
    return router;
}
//# sourceMappingURL=org-node.routes.js.map