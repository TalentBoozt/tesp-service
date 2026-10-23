"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProjectsUseCase = void 0;
class ListProjectsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(options) {
        return await this.repository.findAll(options);
    }
}
exports.ListProjectsUseCase = ListProjectsUseCase;
//# sourceMappingURL=list-projects.use-case.js.map