"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionLibraryUseCase = void 0;
const question_library_entity_1 = require("../../domain/entities/question-library.entity");
class QuestionLibraryUseCase {
    surveyRepo;
    constructor(surveyRepo) {
        this.surveyRepo = surveyRepo;
    }
    async saveItem(props) {
        const item = new question_library_entity_1.QuestionLibraryItemEntity(props);
        return await this.surveyRepo.saveLibraryItem(item);
    }
    async findItems(projectId, category) {
        return await this.surveyRepo.findLibraryItems(projectId, category);
    }
}
exports.QuestionLibraryUseCase = QuestionLibraryUseCase;
//# sourceMappingURL=question-library.use-case.js.map