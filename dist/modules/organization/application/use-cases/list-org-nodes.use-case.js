"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrgNodesUseCase = void 0;
class ListOrgNodesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(projectId, options) {
        return await this.repository.findAllByProject(projectId, options);
    }
}
exports.ListOrgNodesUseCase = ListOrgNodesUseCase;
//# sourceMappingURL=list-org-nodes.use-case.js.map